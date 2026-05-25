#include <ESP32Servo.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <SPI.h>
#include <WiFi.h>
#include <Wire.h>

// ==========================================
// Pins Definition
// ==========================================
#define TRIG_PIN 5
#define ECHO_PIN 18
#define POWER_LED 23
#define LED_25 22
#define LED_50 21
#define LED_75 19
#define LED_100 4
#define SERVO_PIN 13
#define SS_PIN 15
#define RST_PIN 2
#define SCK_PIN 14
#define MOSI_PIN 12
#define MISO_PIN 27
#define I2C_SDA 25
#define I2C_SCL 26

// ==========================================
// Global Objects
// ==========================================
Servo lidServo;
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// User Config
const char *ssid = "HUAWEI P30 Pro";
const char *password = "nnnnnnnn";
const char *serverUrl = "http://192.168.43.35:5001/api/bins/update";
const char *binId = "Abhayapura Junction";

bool manualOverride = false;
float binHeight = 18.5;    // Set to 18.5cm as requested
float fullThreshold = 5.0; // 5cm from sensor is considered 100% full
float alpha = 0.3;
float smoothedDistance = 0;
unsigned long fullDetectedTime = 0;
bool isWaitingToClose = false;

void setup() {
  Serial.begin(115200);

  // --- SERVO FIX: Allocate timers for ESP32 ---
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  lidServo.setPeriodHertz(50);           // Standard 50Hz servo
  lidServo.attach(SERVO_PIN, 500, 2400); // Attach with min/max pulse width
  lidServo.write(0);                     // Initialize to open position
  // --------------------------------------------

  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcd.print("System Setup...");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(POWER_LED, OUTPUT);
  pinMode(LED_25, OUTPUT);
  pinMode(LED_50, OUTPUT);
  pinMode(LED_75, OUTPUT);
  pinMode(LED_100, OUTPUT);
  digitalWrite(POWER_LED, HIGH);

  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  mfrc522.PCD_Init();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  lcd.clear();
  lcd.print("Ready!");
  delay(1000);
}

float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0)
    return -1;
  return (duration * 0.034 / 2);
}

void loop() {
  // RFID Override
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    if (fillLevelCalculated() >= 95) { // Only override if near full
      manualOverride = !manualOverride;
    }
    mfrc522.PICC_HaltA();
    delay(500);
  }

  // Sensor Reading
  float rawDistance = getDistance();
  if (rawDistance > 0 && rawDistance < 400) {
    if (smoothedDistance == 0)
      smoothedDistance = rawDistance;
    smoothedDistance =
        (alpha * rawDistance) + ((1.0 - alpha) * smoothedDistance);
  }

  int fillLevel =
      ((binHeight - smoothedDistance) / (binHeight - fullThreshold)) * 100;
  if (fillLevel < 0)
    fillLevel = 0;
  if (fillLevel > 100)
    fillLevel = 100;

  // Status from Backend
  static String lastStatus = "active";
  
  // LCD Update
  lcd.setCursor(0, 0);
  lcd.print("Lvl:");
  lcd.print(fillLevel);
  lcd.print("% ");

  if (lastStatus == "dispatched") {
    lcd.print("TRUCK!!   ");
  } else if (manualOverride) {
    lcd.print("OVERRIDE  ");
  } else if (fillLevel >= 100) {
    lcd.print("FULL      ");
  } else {
    lcd.print("OPEN      ");
  }

  lcd.setCursor(0, 1);
  if (lastStatus == "dispatched") {
    lcd.print("Truck is Coming ");
  } else {
    lcd.print("Put Garbage Only");
  }

  if (fillLevel < 90)
    manualOverride = false;

  // --- SERVO LOGIC (Normal speed) ---
  if (fillLevel >= 100 && !manualOverride) {
    if (!isWaitingToClose) {
      fullDetectedTime = millis();
      isWaitingToClose = true;
      Serial.println("Bin Full! Waiting 5 seconds before closing lid...");
    }

    if (millis() - fullDetectedTime >= 5000) {
      Serial.println("Closing Lid...");
      lidServo.write(90); // Normal speed close
    } else {
      lidServo.write(0); // Stay open during safety delay
    }
  } else {
    isWaitingToClose = false;
    lidServo.write(0); // Normal speed open
  }

  // Backend Update
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String json = "{\"binId\":\"" + String(binId) +
                  "\",\"fillLevel\":" + String(fillLevel) + 
                  ",\"level\":" + String(fillLevel) + 
                  ",\"lat\":8.58733" +
                  ",\"lng\":81.21514" +
                  ",\"address\":\"Abhayapura Junction, Trincomalee\"" +
                  ",\"zone\":\"Zone D (Residential)\"" + "}";
    
    int httpResponseCode = http.POST(json);
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      // Simple string search for status since we don't have a JSON library easily available
      if (response.indexOf("\"status\":\"dispatched\"") !== -1) {
        lastStatus = "dispatched";
      } else {
        lastStatus = "active";
      }
    }
    http.end();
  } else {
    Serial.println("[WIFI] Not connected, skipping update...");
  }

  // LEDs (25, 50, 75, 100)
  digitalWrite(LED_25, fillLevel >= 25 ? HIGH : LOW);
  digitalWrite(LED_50, fillLevel >= 50 ? HIGH : LOW);
  digitalWrite(LED_75, fillLevel >= 75 ? HIGH : LOW);
  digitalWrite(LED_100, fillLevel >= 100 ? HIGH : LOW);

  delay(200);
}

// Helper to check level for RFID toggle
int fillLevelCalculated() {
  int level =
      ((binHeight - smoothedDistance) / (binHeight - fullThreshold)) * 100;
  return level;
}
