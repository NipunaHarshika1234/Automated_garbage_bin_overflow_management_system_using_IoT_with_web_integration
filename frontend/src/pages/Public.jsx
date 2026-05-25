import { useState, useEffect } from 'react';
import { Leaf, Recycle, MapPin, Phone, ChevronRight, Zap, Target, BarChart3, ShieldCheck } from 'lucide-react';
import LoginModal from './Login';

export default function Public() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen relative bg-slate-950 text-slate-200 scroll-smooth selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Blurry Video Background Layer */}
            <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
                <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="absolute min-w-full min-h-full object-cover scale-110 filter blur-[80px] opacity-30 grayscale-[50%]"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-time-lapse-1694-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-950/40"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950"></div>
            </div>

            {/* Interactive Background Glow Follower (Remaining for mouse effect) */}
            <div 
                className="fixed pointer-events-none -z-10 transition-transform duration-700 ease-out opacity-20"
                style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }}
            ></div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-[100] px-6 py-5 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="flex items-center gap-2.5 text-emerald-400 font-black text-2xl tracking-tighter">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30">
                        <Recycle className="h-6 w-6" />
                    </div>
                    UrbanClean
                </div>
                <div className="hidden lg:flex gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
                    <a href="#challenge" className="hover:text-emerald-400 transition-all hover:scale-110">The Challenge</a>
                    <a href="#solution" className="hover:text-emerald-400 transition-all hover:scale-110">IoT Solution</a>
                    <a href="#vision" className="hover:text-emerald-400 transition-all hover:scale-110">Future Vision</a>
                </div>
                <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-7 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center gap-16 relative z-10">
                    <div 
                        className="flex-1 space-y-8 text-center xl:text-left animate-in fade-in slide-in-from-left-8 duration-1000"
                        style={{
                            transform: `translate(${mousePos.x * 0.005}px, ${mousePos.y * 0.005}px)`
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
                            <Zap size={14} className="fill-emerald-400" /> Next-Gen Smart City Infrastructure
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] text-white tracking-tighter italic">
                            SMART WASTE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">EVOLUTION.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed font-medium">
                            Say goodbye to overflowing bins. We're using IoT and real-time monitoring to build the most efficient waste management network in the region.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center xl:justify-start pt-4">
                            <a href="#challenge" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg transition-all hover:bg-emerald-400 shadow-2xl flex items-center justify-center gap-2 group">
                                Explore Project <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                    <div 
                        className="flex-1 w-full max-w-3xl relative animate-in fade-in zoom-in duration-1000 delay-300"
                        style={{
                            transform: `translate(${mousePos.x * -0.005}px, ${mousePos.y * -0.005}px)`
                        }}
                    >
                        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl rounded-[3rem]"></div>
                        <div className="relative group perspective-1000">
                            <img 
                                src="/pictures/iotenabled-smart-waste-management-system_1168612-375289.avif" 
                                alt="IoT Smart Waste System" 
                                className="rounded-[2.5rem] object-cover h-[500px] w-full shadow-2xl border border-white/10 group-hover:rotate-y-3 transition-transform duration-700" 
                            />
                            <div className="absolute bottom-10 left-10 p-6 glass-effect rounded-2xl border border-white/10 backdrop-blur-3xl">
                                <div className="text-2xl font-black text-white">100% Digital</div>
                                <div className="text-emerald-400 font-bold">Real-time IoT Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Challenge - Section 1 */}
            <section id="challenge" className="py-32 px-6 bg-slate-900/30 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-20">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black text-white italic">THE GROWING <span className="text-red-500">PROBLEM.</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Traditional waste collection is reactive and inefficient. Bins overflow, streets get littered, and manual tracking leads to wasted fuel and unhealthy environments.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                                <span className="text-4xl font-black text-red-500 block">40%</span>
                                <span className="text-sm text-slate-500 font-bold uppercase italic">Fuel Wasted</span>
                            </div>
                            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                                <span className="text-4xl font-black text-red-500 block">65%</span>
                                <span className="text-sm text-slate-500 font-bold uppercase italic">Response Latency</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
                        <img 
                            src="/pictures/a-vibrant-urban-scene-depicting-a-street-littered-with-trash-as-the-sun-sets-highlighting-the-challenges-of-waste-management-and-environmental-neglect-in-city-life-photo.jpeg" 
                            alt="Urban Waste Challenge" 
                            className="w-full h-[400px] object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* IoT Device Feature */}
            <section id="solution" className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8 order-2 md:order-1">
                        <div className="bg-emerald-500/10 w-fit px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase italic">
                            Hardware & Connectivity
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic leading-none">THINKING <span className="text-emerald-400">INSIDE</span> THE BOX.</h2>
                        <ul className="space-y-6">
                            {[
                                { icon: <Zap size={20} />, title: "Ultrasonic Detection", desc: "Non-stop sensing of volume levels with 99.9% accuracy." },
                                { icon: <Target size={20} />, title: "Precision Location", desc: "GPS tracking ensures the council knows exactly which bin is where." },
                                { icon: <ShieldCheck size={20} />, title: "Citizen Alerts", desc: "Direct communication between residents and collection teams." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-6 items-start group">
                                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shadow-xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight">{item.title}</h4>
                                        <p className="text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 order-1 md:order-2 relative group">
                        <div className="absolute -inset-1 bg-emerald-500/50 blur-[80px] rounded-full opacity-30 group-hover:opacity-50 transition-all"></div>
                        <img 
                            src="/pictures/smart bin.webp" 
                            alt="Smart Bin Prototype" 
                            className="w-full h-auto max-w-md mx-auto relative z-10 animate-float translate-y-[-20px] filter drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all group-hover:scale-105 duration-700" 
                        />
                    </div>
                </div>
            </section>

            {/* Vision / Future Vision */}
            <section id="vision" className="py-40 px-6 relative">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/pictures/squaddeepfx_city_powered_by_renewable_energy_realistic_natural__0ba13b2e-9d21-4690-ac09-eb50fb13c06b-768x512.jpg" 
                        alt="Clean City Vision" 
                        className="w-full h-full object-cover opacity-20 filter blur-[2px]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950"></div>
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
                    <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter">OUR ULTIMATE <span className="text-emerald-400">VISION.</span></h2>
                    <p className="text-slate-300 text-xl md:text-2xl font-medium leading-relaxed italic opacity-80">
                        A world where urban cleanliness is automated, sustainable, and transparent. We aren't just managing waste; we are cleaning the fabric of city life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-3xl group hover:bg-emerald-500/10 transition-colors">
                            <BarChart3 className="text-emerald-400" />
                            <div className="text-left">
                                <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Global Goal</div>
                                <div className="text-white font-black text-lg group-hover:text-emerald-400 transition-colors">Zero Waste Streets</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative py-20 px-6 bg-emerald-500 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-white/10 blur-3xl rounded-full transition-transform duration-700 ease-out"
                    style={{
                        transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)`
                    }}
                ></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                    <div>
                        <h2 className="text-4xl font-black text-slate-950 tracking-tighter italic">READY TO JOIN THE MOVEMENT?</h2>
                        <p className="text-emerald-950 font-bold opacity-80 uppercase tracking-widest text-sm">Securely log in to manage your city's waste operations.</p>
                    </div>
                    <button 
                        onClick={() => setIsLoginModalOpen(true)}
                        className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xl hover:scale-110 transition-all shadow-2xl active:scale-95 cursor-pointer uppercase italic tracking-tighter"
                    >
                        Sign In Now <ChevronRight size={28} className="inline-block" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="py-16 px-6 bg-slate-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-2xl tracking-tighter">
                            <Recycle /> UrbanClean
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Pioneering IoT solutions for sustainable urban environments. Connected, Clean, Intelligent.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6 italic">Support Council</h4>
                        <ul className="space-y-3 text-slate-500 text-sm font-bold uppercase tracking-wider">
                            <li className="flex items-center gap-3"><Phone size={16} className="text-emerald-400" /> Support: +94 11 234 5678</li>
                            <li className="flex items-center gap-3"><MapPin size={16} className="text-emerald-400" /> Trincomalee Town, LK</li>
                        </ul>
                    </div>
                    <div className="text-slate-500 text-xs font-black uppercase tracking-widest space-y-4">
                        <div>&copy; 2026 UrbanClean Ecosystem. All rights reserved.</div>
                        <div className="text-emerald-500">Built with IoT & Firebase Core.</div>
                    </div>
                </div>
            </footer>

            {/* Modal Overlay */}
            <LoginModal
                show={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .rotate-y-3:hover {
                    transform: rotateY(5deg) scale(1.02);
                }
            `}</style>
        </div>
    );
}
