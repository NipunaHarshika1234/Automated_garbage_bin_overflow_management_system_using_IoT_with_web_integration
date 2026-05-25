import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Bell, ArrowRight, User, LogOut, Recycle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, onSnapshot, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function CitizenDashboard() {
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState(null);
    const [calendarData, setCalendarData] = useState({});
    const [notified, setNotified] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const q = query(collection(db, 'collections'), orderBy('date', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) setSchedule(snapshot.docs[0].data());
        });

        const unsubscribeCalendar = onSnapshot(collection(db, 'garbage_calendar'), (snapshot) => {
            const data = {};
            snapshot.docs.forEach(doc => {
                data[doc.id] = doc.data();
            });
            setCalendarData(data);
        });

        return () => {
            unsubscribe();
            unsubscribeCalendar();
        };
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        localStorage.clear();
        navigate('/');
    };

    const notifyPrepared = async () => {
        try {
            const [firstName, lastName] = user.name ? user.name.split(' ') : ['Citizen', ''];
            await addDoc(collection(db, 'notifications'), {
                firstName,
                lastName: lastName || '',
                zone: user.zone || 'Unspecified Zone',
                userId: user.uid,
                createdAt: serverTimestamp()
            });
            setNotified(true);
            setTimeout(() => setNotified(false), 5000);
        } catch (err) {
            alert('Error sending notification');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="px-8 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center fixed top-0 w-full z-10">
                <div className="flex items-center gap-4">
                    <Recycle className="text-emerald-400" />
                    <h1 className="text-lg font-bold">UrbanClean Citizen</h1>
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                    <LogOut size={18} /> Sign Out
                </button>
            </nav>

            <main className="pt-24 px-8 pb-12 max-w-4xl mx-auto space-y-8">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 italic">Welcome, {user.name || 'Citizen'}</h2>
                        <p className="text-slate-400">Keep our city clean and green.</p>
                    </div>
                    <div className="bg-emerald-500/20 p-4 rounded-full"><User className="text-emerald-400 h-10 w-10" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6">
                        <div className="flex items-center gap-3 text-blue-400"><CalendarDays /> <h3 className="font-bold">Next Collection Round</h3></div>
                        {schedule ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900 rounded-xl">
                                    <p className="text-xs text-slate-500 uppercase font-black mb-1">Incoming Date</p>
                                    <p className="text-xl font-bold text-white">{new Date(schedule.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl">
                                    <p className="text-xs text-slate-500 uppercase font-black mb-1">Garbage Category</p>
                                    <p className="text-xl font-bold text-emerald-400">{schedule.category || 'All Waste'}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl">
                                    <p className="text-xs text-slate-500 uppercase font-black mb-1">Target Areas</p>
                                    <p className="text-sm text-slate-300 font-bold">{schedule.areas?.join(', ')}</p>
                                </div>
                                {schedule.notices?.map((n, i) => <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 italic">"{n}"</div>)}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No schedule posted.</p>
                        )}
                    </div>

                    <div className="bg-emerald-500 p-8 rounded-2xl flex flex-col justify-between group shadow-xl shadow-emerald-500/10">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold text-slate-900 leading-tight">Garbage Ready <br /> for Pickup?</h3>
                            <p className="text-slate-800 font-medium">Click below to notify our collection team that you are ready.</p>
                        </div>
                        <button onClick={notifyPrepared} disabled={notified} className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${notified ? 'bg-slate-900 text-emerald-400' : 'bg-slate-900 text-white hover:bg-black'}`}>
                            {notified ? <><CheckCircle size={24} /> Sent Successfully</> : <><ArrowRight size={24} /> I'm Ready Now</>}
                        </button>
                    </div>
                </div>

                {/* Calendar View for Citizens */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-emerald-400">
                            <CalendarDays />
                            <h3 className="text-xl font-bold italic uppercase tracking-wider">Weekly Schedule</h3>
                        </div>
                        <div className="flex gap-4">
                            {['Organic', 'Plastic/Glass', 'Paper', 'Hazardous'].map(type => (
                                <div key={type} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <div className={`w-2 h-2 rounded-full ${
                                        type === 'Organic' ? 'bg-emerald-500' : 
                                        type === 'Plastic/Glass' ? 'bg-blue-500' : 
                                        type === 'Paper' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></div>
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {(() => {
                            const days = [];
                            const today = new Date();
                            
                            for (let i = 0; i < 7; i++) {
                                const date = new Date(today);
                                date.setDate(today.getDate() + i);
                                const dateKey = date.toISOString().split('T')[0];
                                const schedule = calendarData[dateKey];
                                const isToday = i === 0;

                                days.push(
                                    <div key={i} className={`p-4 rounded-xl border transition-all ${isToday ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/5' : 'bg-slate-900/50 border-slate-700'}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-lg font-bold mb-3 ${isToday ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {date.getDate()}
                                        </div>
                                        
                                        {schedule ? (
                                            <div className={`text-[9px] font-black uppercase py-1 px-2 rounded-md border text-center ${
                                                schedule.type === 'Organic' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                                                schedule.type === 'Plastic/Glass' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                                                schedule.type === 'Paper' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                                                'bg-red-500/10 border-red-500/30 text-red-400'
                                            }`}>
                                                {schedule.type}
                                            </div>
                                        ) : (
                                            <div className="text-[8px] text-slate-700 font-bold uppercase italic text-center">N/A</div>
                                        )}
                                    </div>
                                );
                            }
                            return days;
                        })()}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic text-center tracking-widest opacity-50">Please ensure your garbage is sorted according to the category above.</p>
                </div>
            </main>
        </div>
    );
}
