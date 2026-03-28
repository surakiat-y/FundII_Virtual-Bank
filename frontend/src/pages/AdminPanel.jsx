import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [fundData, setFundData] = useState({
        fundCode: '',
        fundName: '',
        nav: '',
        type: 'Low Risk'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/funds/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...fundData,
                    nav: parseFloat(fundData.nav) // แปลงตัวเลขก่อนส่ง
                })
            });
            if (res.ok) {
                alert("เพิ่มกองทุนสำเร็จแล้วโบร!");
                setFundData({ fundCode: '', fundName: '', nav: '', type: 'Low Risk' });
            }
        } catch (err) {
            console.error(err);
            alert("พังน้าโบร เช็ค Backend ด่วน!");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800">Admin</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-slate-400 font-bold hover:text-slate-600 uppercase text-[10px] tracking-widest">Back</button>
                </div>
                
                <p className="text-slate-400 text-xs mb-8">เพิ่มกองทุนใหม่เข้าสู่ระบบ Virtual Bank Marketplace</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fund Code</label>
                        <input type="text" placeholder="เช่น VB-GOLD" required
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" 
                            onChange={e => setFundData({...fundData, fundCode: e.target.value})} value={fundData.fundCode} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fund Name</label>
                        <input type="text" placeholder="เช่น กองทุนรวมทองคำ" required
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" 
                            onChange={e => setFundData({...fundData, fundName: e.target.value})} value={fundData.fundName} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Initial NAV</label>
                        <input type="number" step="0.0001" placeholder="เช่น 10.5000" required
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold font-mono" 
                            onChange={e => setFundData({...fundData, nav: e.target.value})} value={fundData.nav} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Risk Level</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold appearance-none" 
                            onChange={e => setFundData({...fundData, type: e.target.value})} value={fundData.type}>
                            <option value="Low Risk">Low Risk</option>
                            <option value="Medium Risk">Medium Risk</option>
                            <option value="High Risk">High Risk</option>
                        </select>
                    </div>

                    <button type="submit" 
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 mt-4">
                        Launch Fund
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminPanel;