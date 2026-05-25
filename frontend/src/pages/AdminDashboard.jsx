import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    LayoutGrid,
    Map as MapIcon,
    Calendar,
    Bell,
    LogOut,
    CheckCircle,
    AlertTriangle,
    Truck,
    Search,
    Trash
} from 'lucide-react';
import L from 'leaflet';
import { auth, db } from '../firebase';
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Custom Marker Icon Generator
const createBinIcon = (fillLevel, status, level) => {
    const finalLevel = fillLevel !== undefined ? fillLevel : (level !== undefined ? level : 0);
    const isOverflowing = status === 'overflowing' || finalLevel >= 100;
    const color = status === 'dispatched' ? '#3b82f6' : (isOverflowing ? '#ef4444' : '#10b981');

    return new L.DivIcon({
        className: 'custom-bin-marker',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
                <div style="background: ${color}; color: white; font-size: 10px; font-weight: 900; padding: 1px 5px; border-radius: 4px; margin-bottom: 2px; border: 1.5px solid white; white-space: nowrap;">${finalLevel}%</div>
                <div style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17" stroke="white" stroke-width="1.5"></line>
                        <line x1="14" y1="11" x2="14" y2="17" stroke="white" stroke-width="1.5"></line>
                    </svg>
                    ${status === 'dispatched' ? `
                        <div style="position: absolute; bottom: -5px; right: -5px; background: #3b82f6; border-radius: 50%; padding: 4px; border: 2px solid white; animation: bounce 1s infinite;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        </div>
                    ` : ''}
                </div>
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45]
    });
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [bins, setBins] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedZones, setSelectedZones] = useState([]);
    const [noticeText, setNoticeText] = useState('');
    const [category, setCategory] = useState('All Waste');
    const [scheduleStatus, setScheduleStatus] = useState('');
    const [calendarData, setCalendarData] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const unsubscribeBins = onSnapshot(collection(db, 'bins'), (snapshot) => {
            setBins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
        const unsubscribeNotifs = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeCalendar = onSnapshot(collection(db, 'garbage_calendar'), (snapshot) => {
            const data = {};
            snapshot.docs.forEach(doc => {
                data[doc.id] = doc.data();
            });
            setCalendarData(data);
        });

        return () => {
            unsubscribeBins();
            unsubscribeNotifs();
            unsubscribeCalendar();
        };
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        localStorage.clear();
        navigate('/');
    };

    const resetAllBins = async () => {
        if (!window.confirm('Reset all bins to Active (0%)?')) return;
        setIsSaving(true);
        try {
            const batchPromises = bins.map(bin => 
                updateDoc(doc(db, 'bins', bin.id), { 
                    fillLevel: 0, 
                    status: 'active',
                    updatedAt: serverTimestamp() 
                })
            );
            await Promise.all(batchPromises);
            alert('✅ All bins reset successfully.');
        } catch (err) {
            console.error(err);
            alert('Error resetting bins');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCollect = async (id) => {
        await updateDoc(doc(db, 'bins', id), { fillLevel: 0, status: 'active' });
    };

    const dispatchTruck = async (bin) => {
        try {
            const response = await fetch('http://127.0.0.1:5001/api/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    binId: bin.binId,
                    address: bin.address,
                    zone: bin.zone || 'Unassigned',
                    driverPhone: '0771234567'
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ Truck Dispatched!\nEmail sent and status updated for Bin #${bin.binId}`);
            } else {
                alert(`❌ Dispatch Failed\nReason: ${data.msg}`);
            }
        } catch (err) {
            console.error(err);
            alert('❌ Connection Error');
        }
    };

    const submitSchedule = async (e) => {
        e.preventDefault();
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await addDoc(collection(db, 'collections'), {
                date: tomorrow.toISOString(),
                areas: ['All Zones (Special Day)'],
                category,
                notices: noticeText ? [noticeText] : [],
                createdAt: serverTimestamp(),
                createdBy: user.uid
            });
            setScheduleStatus('Success');
            setSelectedZones([]);
            setNoticeText('');
            setTimeout(() => setScheduleStatus(''), 2000);
        } catch (err) { alert('Error'); }
    };

    const updateCalendarDay = async (dateKey, type) => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'garbage_calendar', dateKey), {
                type,
                updatedAt: serverTimestamp()
            }).catch(async (err) => {
                // If doc doesn't exist, create it
                if (err.code === 'not-found') {
                    await setDoc(doc(db, 'garbage_calendar', dateKey), {
                        type,
                        updatedAt: serverTimestamp()
                    });
                }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await deleteDoc(doc(db, 'notifications', id));
        } catch (err) {
            console.error(err);
            alert('Error deleting notification');
        }
    };

    const triggerNotifications = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://127.0.0.1:5001/api/notifications/trigger-tomorrow', {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ Success!\n${data.count || 0} citizens notified about ${data.type || 'tomorrow'}'s collection.`);
            } else {
                alert(`ℹ️ Notice\n${data.msg || 'No notifications sent.'}`);
            }
        } catch (err) {
            alert(`❌ Connection Error\nCould not reach the automated notification service.\n\nDetails: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${activeTab === id ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <Icon size={20} />
            <span className="text-sm uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full flex flex-col">
                <div className="p-8 border-b border-slate-800">
                    <h2 className="text-xl font-black text-emerald-400 italic">URBANCLEAN</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
                </div>

                <div className="flex-1 py-6">
                    <SidebarItem id="overview" icon={LayoutGrid} label="Dashboard" />
                    <SidebarItem id="map" icon={MapIcon} label="Live Map" />
                    <SidebarItem id="calendar" icon={Calendar} label="Calendar" />
                    <SidebarItem id="schedule" icon={Truck} label="Deploy Fleet" />
                    <SidebarItem id="notifications" icon={Bell} label="Alerts" />
                </div>

                <div className="p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-8 h-8 rounded bg-emerald-500 text-slate-900 flex items-center justify-center font-bold">{user.name?.[0] || 'A'}</div>
                        <div className="text-xs font-bold truncate">{user.name || 'Admin'}</div>
                    </div>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest px-2 transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 bg-slate-950">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold uppercase italic tracking-tighter">
                            {activeTab === 'overview' && "Dashboard Overview"}
                            {activeTab === 'map' && "Real-time Bin Map"}
                            {activeTab === 'calendar' && "Garbage Collection Calendar"}
                            {activeTab === 'schedule' && "Logistics Scheduling"}
                            {activeTab === 'notifications' && "Citizen Feed"}
                        </h1>
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Manage waste operations efficiently</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={resetAllBins}
                            className="bg-slate-900 hover:bg-red-500/10 hover:text-red-500 text-slate-500 text-[10px] font-black uppercase px-4 py-2 rounded-lg border border-slate-800 transition-all"
                        >
                            Reset Bins
                        </button>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <Search className="text-slate-500" size={20} />
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {bins.filter(b => (b.fillLevel ?? b.level ?? 0) >= 100).length > 0 && (
                            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg shadow-red-500/10 animate-pulse">
                                <h3 className="text-red-500 font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-2">
                                    <AlertTriangle size={18} /> Critical: Overflowing Bins Detected
                                </h3>
                                <div className="space-y-1">
                                    {Object.entries(
                                        bins.filter(b => (b.fillLevel ?? b.level ?? 0) >= 100).reduce((acc, bin) => {
                                            const zone = bin.zone || 'Unassigned';
                                            if (!acc[zone]) acc[zone] = [];
                                            acc[zone].push(bin);
                                            return acc;
                                        }, {})
                                    ).map(([zone, zoneBins]) => (
                                        <div key={zone} className="text-sm font-bold text-red-400">
                                            <span className="uppercase underline mr-2">{zone}:</span>
                                            {zoneBins.map(b => `#${b.binId} (${b.address})`).join(', ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <Trash className="text-blue-500 mb-2" />
                                <div className="text-3xl font-bold">{bins.length}</div>
                                <div className="text-xs text-slate-500 uppercase font-black italic">Total Nodes</div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <AlertTriangle className="text-red-500 mb-2" />
                                <div className="text-3xl font-bold">{bins.filter(b => b.status === "overflowing" || (b.fillLevel ?? b.level ?? 0) >= 100).length}</div>
                                <div className="text-xs text-slate-500 uppercase font-black italic">Critical Overflow</div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <CheckCircle className="text-emerald-500 mb-2" />
                                <div className="text-3xl font-bold">{bins.filter(b => (b.status === "active" || b.status === undefined) && (b.fillLevel ?? b.level ?? 0) < 100).length}</div>
                                <div className="text-xs text-slate-500 uppercase font-black italic">Operational</div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Bin ID</th>
                                        <th className="px-6 py-4">Zone</th>
                                        <th className="px-6 py-4">Address</th>
                                        <th className="px-6 py-4">Fill Level</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {bins.slice(0, 10).map(bin => (
                                        <tr key={bin.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm">#{bin.binId}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-emerald-400 uppercase">{bin.zone || 'Unassigned'}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{bin.address}</td>
                                            <td className={`px-6 py-4 font-bold text-xs ${bin.status === 'dispatched' ? 'text-blue-400' : ((bin.fillLevel ?? bin.level ?? 0) >= 100 ? 'text-red-500' : 'text-emerald-500')}`}>
                                                <div className="flex flex-col">
                                                    <span>{bin.fillLevel ?? bin.level ?? 0}%</span>
                                                    {bin.status === 'dispatched' && (
                                                        <span className="text-[10px] font-black italic mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 flex items-center gap-2 w-fit animate-pulse">
                                                            <Truck size={12} /> TRUCK DISPATCHED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {bin.status === 'overflowing' && (
                                                        <button 
                                                            onClick={() => dispatchTruck(bin)}
                                                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                            title="Dispatch Truck"
                                                        >
                                                            <Truck size={14} />
                                                        </button>
                                                    )}
                                                    {bin.status === 'dispatched' && (
                                                        <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 italic px-2">
                                                            <Truck size={12} className="animate-bounce" /> DISPATCHED
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => handleCollect(bin.id)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                                        title="Clear Bin"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="h-[650px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
                        <MapContainer center={[8.58733, 81.21514]} zoom={15} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                            
                            {(() => {
                                // Prepare the list of bins to display
                                // Ensure Abhayapura Junction is always represented, even if not in DB yet
                                const abhayapuraId = "Abhayapura Junction";
                                const displayBins = [...bins];
                                
                                const hasAbhayapura = displayBins.find(b => 
                                    b.id === abhayapuraId || 
                                    (b.binId && b.binId.toLowerCase().includes("abhayapura"))
                                );

                                if (!hasAbhayapura) {
                                    displayBins.push({
                                        id: abhayapuraId,
                                        binId: abhayapuraId,
                                        latitude: 8.58733,
                                        longitude: 81.21514,
                                        fillLevel: 0,
                                        status: 'active',
                                        address: "Abhayapura Junction, Trincomalee",
                                        isPlaceholder: true
                                    });
                                }

                                return displayBins.map(bin => {
                                    const lat = parseFloat(bin.latitude);
                                    const lng = parseFloat(bin.longitude);
                                    if (isNaN(lat) || isNaN(lng) || lat === 0) return null;

                                    return (
                                        <Marker key={bin.id} position={[lat, lng]} icon={createBinIcon(bin.fillLevel, bin.status || 'active', bin.level)}>
                                            <Popup>
                                                <div className="p-2 min-w-[150px]">
                                                    <div className="font-bold text-slate-800 mb-1">{bin.address || bin.binId || `Bin ${bin.id}`}</div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span>Level:</span>
                                                        <span className={`font-bold ${bin.status === 'overflowing' || (bin.fillLevel ?? bin.level ?? 0) >= 100 ? 'text-red-600' : (bin.status === 'dispatched' ? 'text-blue-500' : 'text-emerald-600')}`}>
                                                            {bin.fillLevel ?? bin.level ?? 0}%
                                                        </span>
                                                    </div>
                                                    {bin.isPlaceholder ? (
                                                        <div className="text-[10px] text-amber-600 font-bold italic bg-amber-50 p-2 rounded border border-amber-100">
                                                            ⚠️ Waiting for sensor signal...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {bin.status === 'dispatched' ? (
                                                                <div className="bg-blue-500/10 text-blue-600 text-[10px] font-black p-3 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                                                                    <Truck size={16} /> TRUCK DISPATCHED
                                                                </div>
                                                            ) : bin.status === 'overflowing' ? (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => dispatchTruck(bin)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1">
                                                                        <Truck size={12} /> Dispatch
                                                                    </button>
                                                                    <button onClick={() => handleCollect(bin.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1">
                                                                        <CheckCircle size={12} /> Clear
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => handleCollect(bin.id)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold py-2 rounded">Force Clear</button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                });
                            })()}
                        </MapContainer>
                    </div>
                )}

                              {activeTab === 'calendar' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold italic uppercase">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">←</button>
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">→</button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={triggerNotifications}
                                        disabled={isSaving}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 mr-4"
                                    >
                                        <Bell size={14} /> {isSaving ? 'Processing...' : 'Broadcast Notifications'}
                                    </button>
                                    {['Organic', 'Plastic/Glass', 'Paper', 'Hazardous'].map(type => (
                                        <div key={type} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                            <div className={`w-3 h-3 rounded-full ${
                                                type === 'Organic' ? 'bg-emerald-500' : 
                                                type === 'Plastic/Glass' ? 'bg-blue-500' : 
                                                type === 'Paper' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest pb-4">{day}</div>
                                ))}
                                
                                {(() => {
                                    const days = [];
                                    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                    
                                    // Empty cells for days before start of month
                                    for (let i = 0; i < firstDay.getDay(); i++) {
                                        days.push(<div key={`empty-${i}`} className="h-32"></div>);
                                    }
                                    
                                    // Actual days
                                    for (let d = 1; d <= lastDay.getDate(); d++) {
                                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                                        const dateKey = date.toISOString().split('T')[0];
                                        const schedule = calendarData[dateKey];
                                        
                                        days.push(
                                            <div key={d} className="h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all group relative">
                                                <div className="text-sm font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">{d}</div>
                                                
                                                {schedule ? (
                                                    <div className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                                                        schedule.type === 'Organic' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 
                                                        schedule.type === 'Plastic/Glass' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 
                                                        schedule.type === 'Paper' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 
                                                        'bg-red-500/10 border-red-500/50 text-red-400'
                                                    }`}>
                                                        {schedule.type}
                                                    </div>
                                                ) : (
                                                    <div className="text-[8px] text-slate-700 font-bold uppercase italic">No Setup</div>
                                                )}

                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/95 rounded-2xl flex flex-col p-2 gap-1 justify-center transition-opacity z-10 border border-emerald-500">
                                                    {['Organic', 'Plastic/Glass', 'Paper', 'Hazardous', 'Clear'].map(type => (
                                                        <button 
                                                            key={type}
                                                            onClick={() => type === 'Clear' ? updateCalendarDay(dateKey, null) : updateCalendarDay(dateKey, type)}
                                                            className={`text-[8px] font-black uppercase py-1 rounded hover:bg-white hover:text-black transition-colors ${
                                                                type === 'Clear' ? 'text-red-500 border border-red-500/30' : 'text-slate-300'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return days;
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="max-w-2xl bg-slate-900 p-10 rounded-2xl border border-slate-800 animate-fadeIn">
                        <form onSubmit={submitSchedule} className="space-y-6">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl mb-8">
                                    <p className="text-emerald-400 font-bold italic text-sm text-center">
                                        🚀 Fleet will be deployed across ALL ZONES for this special collection.
                                    </p>
                                </div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4 italic">Garbage Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['Organic', 'Plastic/Glass', 'Paper', 'All Waste'].map(cat => (
                                        <button type="button" key={cat} onClick={() => setCategory(cat)} className={`py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>{cat}</button>
                                    ))}
                                </div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4 italic">Note Notice</label><textarea value={noticeText} onChange={(e) => setNoticeText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-emerald-500" rows="3" placeholder="Message..."></textarea></div>
                            <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl shadow-2xl hover:scale-[1.01] active:translate-y-1 transition-all uppercase tracking-[0.2em] italic flex items-center justify-center gap-3"><Truck size={20} /> Deploy Fleet</button>
                            {scheduleStatus && <p className="text-center text-emerald-400 font-bold animate-pulse">{scheduleStatus}</p>}
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group transition-all hover:border-slate-700">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button 
                                            onClick={() => deleteNotification(notif.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                                            title="Dismiss Alert"
                                        >
                                            <Trash size={16} />
                                        </button>
                                        <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded-lg"><Bell size={18} /></div>
                                    </div>
                                    <div className="mb-4"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Citizen</p><p className="text-lg font-bold italic uppercase">{notif.firstName} {notif.lastName}</p></div>
                                    <div className="mb-2"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Zone</p><p className="text-emerald-400 font-bold text-xs">{notif.zone}</p></div>
                                    <div className="text-[10px] text-slate-700 font-bold uppercase mt-4">Received: {notif.createdAt ? new Date(notif.createdAt.toDate?.() || notif.createdAt).toLocaleTimeString() : 'Recent'}</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest italic">No community signals...</div>
                        )}
                    </div>
                )}
            </main>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .custom-bin-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
}
