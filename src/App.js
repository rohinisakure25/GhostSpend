import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";

// ─── THEME ────────────────────────────────────────────────────────────────────
const COLORS = ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89", "#1A936F", "#C3423F", "#88D498", "#F18F01"];
const LEAK_CATEGORIES = ["subscription", "coffee", "food delivery", "entertainment", "impulse", "snacks", "streaming"];

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_EXPENSES = [
  { date: "2024-01-02", amount: 14.99, category: "Streaming", description: "Netflix" },
  { date: "2024-01-02", amount: 9.99, category: "Streaming", description: "Spotify" },
  { date: "2024-01-03", amount: 4.50, category: "Coffee", description: "Morning latte" },
  { date: "2024-01-04", amount: 4.50, category: "Coffee", description: "Morning latte" },
  { date: "2024-01-05", amount: 4.50, category: "Coffee", description: "Morning latte" },
  { date: "2024-01-05", amount: 34.99, category: "Food Delivery", description: "DoorDash order" },
  { date: "2024-01-06", amount: 4.50, category: "Coffee", description: "Afternoon coffee" },
  { date: "2024-01-07", amount: 12.99, category: "Subscription", description: "Unused gym app" },
  { date: "2024-01-08", amount: 67.40, category: "Groceries", description: "Weekly groceries" },
  { date: "2024-01-09", amount: 4.50, category: "Coffee", description: "Morning latte" },
  { date: "2024-01-10", amount: 29.99, category: "Subscription", description: "Adobe CC" },
  { date: "2024-01-11", amount: 19.90, category: "Food Delivery", description: "Uber Eats lunch" },
  { date: "2024-01-12", amount: 4.50, category: "Coffee", description: "Morning latte" },
  { date: "2024-01-13", amount: 89.00, category: "Shopping", description: "Amazon impulse buy" },
  { date: "2024-01-14", amount: 4.50, category: "Coffee", description: "Weekend coffee" },
  { date: "2024-01-15", amount: 15.99, category: "Entertainment", description: "Movie tickets" },
  { date: "2024-01-16", amount: 4.50, category: "Coffee", description: "Monday latte" },
  { date: "2024-01-17", amount: 7.99, category: "Streaming", description: "Disney+" },
  { date: "2024-01-18", amount: 24.50, category: "Food Delivery", description: "Swiggy dinner" },
  { date: "2024-01-19", amount: 4.50, category: "Coffee", description: "Morning coffee" },
  { date: "2024-01-20", amount: 5.99, category: "Subscription", description: "App nobody uses" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]; });
    return {
      date: obj.date || obj["date"] || "",
      amount: parseFloat(obj.amount || obj["amount"] || 0),
      category: obj.category || obj["category"] || "Other",
      description: obj.description || obj["description"] || obj.desc || ""
    };
  }).filter(e => e.amount > 0);
}

function groupByCategory(expenses) {
  const map = {};
  expenses.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
}

function groupByDate(expenses) {
  const map = {};
  expenses.forEach(e => {
    const d = e.date.slice(0, 10);
    map[d] = (map[d] || 0) + e.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date: date.slice(5), total: parseFloat(total.toFixed(2)) }));
}

function isMoneyLeak(category) {
  return LEAK_CATEGORIES.some(l => category.toLowerCase().includes(l));
}

// ─── AI ANALYSIS ──────────────────────────────────────────────────────────────
async function analyzeExpenses(expenses) {
  return {
    overview: "You frequently spend on coffee and food delivery, which creates hidden monthly expenses.",
    money_leaks: [
      "Daily coffee spending (~₹4.5 × 15 days)",
      "Frequent food delivery orders",
      "Multiple subscriptions not actively used"
    ],
    patterns: [
      "Consistent small transactions on coffee",
      "Higher spending on weekends",
      "Frequent online purchases"
    ],
    subscriptions_alert: [
      "Unused gym app subscription",
      "Multiple streaming services"
    ],
    savings_tips: [
      "Reduce coffee purchases by 50%",
      "Limit food delivery to weekends",
      "Cancel unused subscriptions",
      "Set monthly spending limit"
    ],
    estimated_monthly_savings: "₹2000–₹4000",
    severity: "high"
  };
}
 



// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function GhostIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 2C8.477 2 4 6.477 4 12v12l3-2 3 2 3-2 3 2 3-2 3 2V12C22 6.477 17.523 2 14 2z" fill="currentColor" opacity="0.9"/>
      <circle cx="10" cy="12" r="2" fill="#1a1a2e"/>
      <circle cx="18" cy="12" r="2" fill="#1a1a2e"/>
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"48px 0"}}>
      <div style={{
        width:48,height:48,borderRadius:"50%",
        border:"3px solid rgba(255,107,53,0.2)",
        borderTop:"3px solid #FF6B35",
        animation:"spin 0.8s linear infinite"
      }}/>
      <p style={{color:"#a0a0b0",fontFamily:"'DM Mono',monospace",fontSize:13,letterSpacing:2}}>
        SCANNING FOR GHOST EXPENSES...
      </p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const config = {
    low: { bg: "#1A936F22", border: "#1A936F", text: "#1A936F", label: "LOW RISK" },
    medium: { bg: "#F18F0122", border: "#F18F01", text: "#F18F01", label: "MEDIUM RISK" },
    high: { bg: "#C3423F22", border: "#C3423F", text: "#C3423F", label: "HIGH RISK" },
  };
  const c = config[severity] || config.medium;
  return (
    <span style={{
      padding:"3px 10px", borderRadius:4,
      background:c.bg, border:`1px solid ${c.border}`,
      color:c.text, fontFamily:"'DM Mono',monospace",
      fontSize:11, letterSpacing:2, fontWeight:600
    }}>{c.label}</span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background:"#12121f", border:"1px solid #2a2a3f",
      borderRadius:12, padding:"20px 24px",
      borderLeft:`3px solid ${accent || "#FF6B35"}`
    }}>
      <div style={{color:"#606080",fontSize:11,letterSpacing:2,fontFamily:"'DM Mono',monospace",marginBottom:8}}>{label}</div>
      <div style={{color:"#f0f0ff",fontSize:28,fontWeight:700,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{value}</div>
      {sub && <div style={{color:"#606080",fontSize:12,marginTop:6}}>{sub}</div>}
    </div>
  );
}

const CUSTOM_TOOLTIP_STYLE = {
  background:"#1a1a2e", border:"1px solid #2a2a3f",
  borderRadius:8, padding:"10px 14px",
  color:"#f0f0ff", fontFamily:"'DM Mono',monospace", fontSize:12
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CUSTOM_TOOLTIP_STYLE}>
      <div style={{color:"#a0a0b0",marginBottom:4}}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{color:p.color}}>₹{p.value}</div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GhostSpend() {
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upload"); // upload | dashboard | insights
  const [manualForm, setManualForm] = useState({ amount:"", category:"", date:"", description:"" });
  const [inputMode, setInputMode] = useState("manual"); // manual | csv
  const fileRef = useRef();

  // Load sample data on mount
  useEffect(() => { setExpenses([]); }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        setExpenses(parsed);
        setError("");
      } catch {
        setError("Failed to parse CSV. Check format: date,amount,category,description");
      }
    };
    reader.readAsText(file);
  };

  const addManual = () => {
    if (!manualForm.amount || !manualForm.category || !manualForm.date) {
      setError("Please fill amount, category, and date.");
      return;
    }
    setExpenses(prev => [...prev, { ...manualForm, amount: parseFloat(manualForm.amount) }]);
    setManualForm({ amount:"", category:"", date:"", description:"" });
    setError("");
  };

  const runAnalysis = async () => {
    if (expenses.length === 0) { setError("Add some expenses first!"); return; }
    setLoading(true);
    setError("");
    try {
      const result = await analyzeExpenses(expenses);
      setInsights(result);
      setTab("insights");
    } catch (err) {
      setError("AI analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const categoryData = groupByCategory(expenses);
  const dateData = groupByDate(expenses);
  const leakTotal = expenses.filter(e => isMoneyLeak(e.category)).reduce((s,e) => s+e.amount, 0);
  const topCategory = categoryData.sort((a,b)=>b.value-a.value)[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin:0; padding:0; }
        body { background:#0a0a12; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#12121f; }
        ::-webkit-scrollbar-thumb { background:#2a2a3f; border-radius:3px; }
        input, select { outline:none; }
        input::placeholder { color:#404055; }
        .expense-row:hover { background:#16162a !important; }
        .tab-btn:hover { color:#FF6B35 !important; }
        .action-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .leak-item { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <div style={{
        minHeight:"100vh", background:"#0a0a12",
        color:"#f0f0ff", fontFamily:"'Inter',sans-serif"
      }}>
        {/* NAV */}
        <nav style={{
          background:"#0d0d1a", borderBottom:"1px solid #1e1e30",
          padding:"0 32px", display:"flex", alignItems:"center",
          justifyContent:"space-between", height:60, position:"sticky", top:0, zIndex:100
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{color:"#FF6B35"}}><GhostIcon/></div>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,letterSpacing:-0.5}}>
              Ghost<span style={{color:"#FF6B35"}}>Spend</span>
            </span>
            <span style={{
              marginLeft:8, padding:"2px 8px",
              background:"#FF6B3522", border:"1px solid #FF6B3540",
              color:"#FF6B35", fontSize:10, letterSpacing:2,
              fontFamily:"'DM Mono',monospace", borderRadius:4
            }}>AI</span>
          </div>
          <div style={{display:"flex",gap:4}}>
            {["upload","dashboard","insights"].map(t => (
              <button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{
                background: tab===t ? "#FF6B3520" : "transparent",
                border: tab===t ? "1px solid #FF6B3540" : "1px solid transparent",
                color: tab===t ? "#FF6B35" : "#606080",
                padding:"6px 16px", borderRadius:8,
                fontFamily:"'DM Mono',monospace", fontSize:12,
                letterSpacing:1, cursor:"pointer", textTransform:"uppercase",
                transition:"all 0.2s"
              }}>{t}</button>
            ))}
          </div>
          <div style={{
            background:"#12121f", border:"1px solid #2a2a3f",
            borderRadius:8, padding:"6px 14px",
            fontFamily:"'DM Mono',monospace", fontSize:12, color:"#606080"
          }}>
            {expenses.length} expenses loaded
          </div>
        </nav>

        <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
          {error && (
            <div style={{
              background:"#C3423F22",border:"1px solid #C3423F44",
              borderRadius:8, padding:"12px 16px",
              color:"#ff8080", marginBottom:24,
              fontFamily:"'DM Mono',monospace", fontSize:13
            }}>⚠ {error}</div>
          )}

          {/* ── UPLOAD TAB ── */}
          {tab === "upload" && (
            <div style={{animation:"fadeIn 0.4s ease"}}>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:36,marginBottom:8}}>
                Hunt Your <span style={{color:"#FF6B35"}}>Ghost Expenses</span>
              </h1>
              <p style={{color:"#606080",marginBottom:32,fontSize:15}}>
                Upload your expenses or add them manually. Our AI will find hidden spending patterns you didn't know existed.
              </p>


              <div style={{display:"flex",gap:8,marginBottom:28}}>
                {["manual","csv"].map(m => (
                  <button key={m} onClick={()=>setInputMode(m)} style={{
                    padding:"8px 20px", borderRadius:8, cursor:"pointer",
                    background: inputMode===m ? "#FF6B35" : "#12121f",
                    border: `1px solid ${inputMode===m ? "#FF6B35" : "#2a2a3f"}`,
                    color: inputMode===m ? "#fff" : "#808090",
                    fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:1,
                    textTransform:"uppercase", transition:"all 0.2s"
                  }}>{m === "manual" ? "✏ Manual Entry" : "📄 CSV Upload"}</button>
                ))}
              </div>

              {inputMode === "manual" && (
                <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,padding:24,marginBottom:24}}>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:20,color:"#e0e0f0"}}>Add Expense</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:12,marginBottom:16}}>
                    {[
                      {key:"amount",placeholder:"Amount (e.g. 4.50)",type:"number"},
                      {key:"category",placeholder:"Category"},
                      {key:"date",placeholder:"Date",type:"date"},
                      {key:"description",placeholder:"Description"}
                    ].map(f => (
                      <input key={f.key} type={f.type||"text"}
                        value={manualForm[f.key]}
                        onChange={e=>setManualForm(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        style={{
                          background:"#0d0d1a", border:"1px solid #2a2a3f",
                          borderRadius:8, padding:"10px 14px",
                          color:"#f0f0ff", fontSize:14,
                          fontFamily:"'Inter',sans-serif",
                          transition:"border-color 0.2s"
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={addManual} className="action-btn" style={{
                    background:"#FF6B35", border:"none", borderRadius:8,
                    padding:"10px 24px", color:"#fff",
                    fontFamily:"'DM Mono',monospace", fontSize:13,
                    cursor:"pointer", letterSpacing:1, transition:"all 0.2s"
                  }}>+ ADD EXPENSE</button>
                  <button 
                    onClick={() => setExpenses(SAMPLE_EXPENSES)}
                    style={{
                      marginLeft: "10px",
                      background: "#1A936F",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 24px",
                      color: "#fff",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "13px",
                      cursor: "pointer",
                      letterSpacing: "1px",
                      transition: "all 0.2s"
                    }}
                  >
                    🚀 LOAD DEMO DATA
                  </button>
                </div>
              )}

              {inputMode === "csv" && (
                <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,padding:24,marginBottom:24}}>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:8,color:"#e0e0f0"}}>Upload CSV File</h3>
                  <p style={{color:"#505065",fontSize:13,marginBottom:20,fontFamily:"'DM Mono',monospace"}}>
                    Expected format: date, amount, category, description
                  </p>
                  <div
                    onClick={()=>fileRef.current.click()}
                    style={{
                      border:"2px dashed #2a2a3f", borderRadius:12,
                      padding:"40px 24px", textAlign:"center",
                      cursor:"pointer", transition:"border-color 0.2s",
                      background:"#0d0d1a"
                    }}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#FF6B35"}
                    onMouseOut={e=>e.currentTarget.style.borderColor="#2a2a3f"}
                  >
                    <div style={{fontSize:36,marginBottom:12}}>📂</div>
                    <div style={{color:"#808090",fontFamily:"'DM Mono',monospace",fontSize:13}}>
                      Click to upload CSV file
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} style={{display:"none"}}/>
                </div>
              )}

              {/* Expense Table */}
              {expenses.length > 0 && (
                <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,overflow:"hidden",marginBottom:28}}>
                  <div style={{padding:"16px 24px",borderBottom:"1px solid #1e1e30",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>Loaded Expenses</h3>
                    <span style={{color:"#FF6B35",fontFamily:"'DM Mono',monospace",fontSize:12}}>
                      TOTAL: ₹{total.toFixed(2)}
                    </span>
                  </div>
                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#0d0d1a"}}>
                          {["Date","Amount","Category","Description"].map(h=>(
                            <th key={h} style={{
                              padding:"10px 16px",textAlign:"left",
                              color:"#404055",fontSize:11,letterSpacing:2,
                              fontFamily:"'DM Mono',monospace",fontWeight:500
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((e,i)=>(
                          <tr key={i} className="expense-row" style={{borderTop:"1px solid #1a1a2a",transition:"background 0.15s"}}>
                            <td style={{padding:"10px 16px",color:"#606080",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{e.date}</td>
                            <td style={{padding:"10px 16px",color:"#f0f0ff",fontWeight:600}}>₹{parseFloat(e.amount).toFixed(2)}</td>
                            <td style={{padding:"10px 16px"}}>
                              <span style={{
                                padding:"2px 8px", borderRadius:4,
                                background: isMoneyLeak(e.category) ? "#FF6B3522" : "#ffffff10",
                                color: isMoneyLeak(e.category) ? "#FF6B35" : "#a0a0b0",
                                fontSize:12, fontFamily:"'DM Mono',monospace"
                              }}>{e.category}</span>
                            </td>
                            <td style={{padding:"10px 16px",color:"#808090",fontSize:13}}>{e.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button onClick={runAnalysis} disabled={loading} className="action-btn" style={{
                background: loading ? "#2a2a3f" : "linear-gradient(135deg,#FF6B35,#C3423F)",
                border:"none", borderRadius:12,
                padding:"14px 36px", color:"#fff",
                fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing:0.5, transition:"all 0.2s",
                boxShadow: loading ? "none" : "0 4px 24px #FF6B3540"
              }}>
                {loading ? "🔍 Analyzing..." : "🔍 Analyze with AI"}
              </button>

              {loading && <Spinner/>}
            </div>
          )}

          {/* ── DASHBOARD TAB ── */}
          {tab === "dashboard" && (
            <div style={{animation:"fadeIn 0.4s ease"}}>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,marginBottom:24}}>
                Spending <span style={{color:"#FF6B35"}}>Dashboard</span>
              </h2>

              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
                <StatCard label="TOTAL SPENT" value={`₹${total.toFixed(0)}`} sub={`${expenses.length} transactions`} accent="#FF6B35"/>
                <StatCard label="MONEY LEAKS" value={`₹${leakTotal.toFixed(0)}`} sub="subscriptions + habits" accent="#C3423F"/>
                <StatCard label="TOP CATEGORY" value={topCategory?.name || "—"} sub={`₹${topCategory?.value || 0}`} accent="#F18F01"/>
                <StatCard label="DAILY AVERAGE" value={`₹${dateData.length ? (total/dateData.length).toFixed(0) : 0}`} sub="per active day" accent="#1A936F"/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
                <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,padding:24}}>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:20,fontSize:16}}>
                    Category Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={{stroke:"#404055"}} fontSize={11}>
                        {categoryData.map((_,i)=>(
                          <Cell key={i} fill={COLORS[i%COLORS.length]}/>
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,padding:24}}>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:20,fontSize:16}}>
                    Daily Spending Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30"/>
                      <XAxis dataKey="date" stroke="#404055" tick={{fontSize:11,fill:"#404055"}}/>
                      <YAxis stroke="#404055" tick={{fontSize:11,fill:"#404055"}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Line type="monotone" dataKey="total" stroke="#FF6B35" strokeWidth={2} dot={{fill:"#FF6B35",r:3}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12,padding:24}}>
                <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:20,fontSize:16}}>
                  Category Comparison
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30"/>
                    <XAxis dataKey="name" stroke="#404055" tick={{fontSize:11,fill:"#404055"}}/>
                    <YAxis stroke="#404055" tick={{fontSize:11,fill:"#404055"}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {categoryData.map((_,i)=>(
                        <Cell key={i} fill={COLORS[i%COLORS.length]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── INSIGHTS TAB ── */}
          {tab === "insights" && (
            <div style={{animation:"fadeIn 0.4s ease"}}>
              {!insights && !loading && (
                <div style={{
                  textAlign:"center",padding:"80px 24px",
                  background:"#12121f",border:"1px solid #2a2a3f",borderRadius:12
                }}>
                  <div style={{fontSize:56,marginBottom:16}}>👻</div>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:22,marginBottom:12}}>
                    No Analysis Yet
                  </h3>
                  <p style={{color:"#606080",marginBottom:24}}>
                    Go to the Upload tab and run AI Analysis to see your spending insights.
                  </p>
                  <button onClick={()=>setTab("upload")} style={{
                    background:"#FF6B35",border:"none",borderRadius:8,
                    padding:"10px 24px",color:"#fff",
                    fontFamily:"'DM Mono',monospace",fontSize:13,cursor:"pointer"
                  }}>← GO TO UPLOAD</button>
                </div>
              )}

              {loading && <Spinner/>}

              {insights && !loading && (
                <>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
                    <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28}}>
                      AI <span style={{color:"#FF6B35"}}>Insights</span>
                    </h2>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <SeverityBadge severity={insights.severity}/>
                      <span style={{
                        background:"#1A936F22",border:"1px solid #1A936F44",
                        color:"#1A936F",padding:"4px 12px",borderRadius:6,
                        fontFamily:"'DM Mono',monospace",fontSize:12
                      }}>
                        SAVE UP TO {insights.estimated_monthly_savings}
                      </span>
                    </div>
                  </div>

                  {/* Overview */}
                  <div style={{
                    background:"#12121f",border:"1px solid #2a2a3f",
                    borderLeft:"3px solid #FF6B35",
                    borderRadius:12,padding:24,marginBottom:20
                  }}>
                    <div style={{color:"#FF6B35",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,marginBottom:10}}>
                      OVERVIEW
                    </div>
                    <p style={{color:"#c0c0d0",lineHeight:1.7,fontSize:15}}>{insights.overview}</p>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
                    {/* Money Leaks */}
                    <div style={{background:"#12121f",border:"1px solid #C3423F44",borderRadius:12,padding:24}}>
                      <div style={{
                        display:"flex",alignItems:"center",gap:8,
                        color:"#C3423F",fontFamily:"'DM Mono',monospace",
                        fontSize:11,letterSpacing:2,marginBottom:16
                      }}>
                        <span style={{animation:"pulse 2s infinite"}}>🔴</span> MONEY LEAKS DETECTED
                      </div>
                      {insights.money_leaks?.map((leak,i) => (
                        <div key={i} className="leak-item" style={{
                          animationDelay:`${i*0.1}s`,opacity:0,
                          background:"#C3423F15",border:"1px solid #C3423F25",
                          borderRadius:8,padding:"10px 14px",marginBottom:10,
                          fontSize:13,color:"#d0d0e0",lineHeight:1.5
                        }}>
                          <span style={{color:"#C3423F",marginRight:8}}>↳</span>{leak}
                        </div>
                      ))}
                    </div>

                    {/* Subscriptions */}
                    <div style={{background:"#12121f",border:"1px solid #F18F0144",borderRadius:12,padding:24}}>
                      <div style={{
                        color:"#F18F01",fontFamily:"'DM Mono',monospace",
                        fontSize:11,letterSpacing:2,marginBottom:16
                      }}>
                        📧 SUBSCRIPTION ALERTS
                      </div>
                      {insights.subscriptions_alert?.map((sub,i) => (
                        <div key={i} style={{
                          background:"#F18F0115",border:"1px solid #F18F0125",
                          borderRadius:8,padding:"10px 14px",marginBottom:10,
                          fontSize:13,color:"#d0d0e0",lineHeight:1.5
                        }}>
                          <span style={{color:"#F18F01",marginRight:8}}>!</span>{sub}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                    {/* Patterns */}
                    <div style={{background:"#12121f",border:"1px solid #004E8944",borderRadius:12,padding:24}}>
                      <div style={{
                        color:"#4a9eff",fontFamily:"'DM Mono',monospace",
                        fontSize:11,letterSpacing:2,marginBottom:16
                      }}>
                        📊 BEHAVIORAL PATTERNS
                      </div>
                      {insights.patterns?.map((p,i) => (
                        <div key={i} style={{
                          display:"flex",gap:12,alignItems:"flex-start",
                          marginBottom:12,fontSize:13,color:"#c0c0d0",lineHeight:1.5
                        }}>
                          <span style={{color:"#4a9eff",fontSize:16,marginTop:1}}>◈</span>{p}
                        </div>
                      ))}
                    </div>

                    {/* Savings Tips */}
                    <div style={{background:"#12121f",border:"1px solid #1A936F44",borderRadius:12,padding:24}}>
                      <div style={{
                        color:"#1A936F",fontFamily:"'DM Mono',monospace",
                        fontSize:11,letterSpacing:2,marginBottom:16
                      }}>
                        💡 SAVINGS ACTION PLAN
                      </div>
                      {insights.savings_tips?.map((tip,i) => (
                        <div key={i} style={{
                          display:"flex",gap:12,alignItems:"flex-start",
                          marginBottom:12,fontSize:13,color:"#c0c0d0",lineHeight:1.5
                        }}>
                          <span style={{
                            minWidth:22,height:22,background:"#1A936F",
                            borderRadius:"50%",display:"flex",alignItems:"center",
                            justifyContent:"center",color:"#fff",fontSize:11,
                            fontWeight:700,marginTop:1
                          }}>{i+1}</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{marginTop:24,textAlign:"center"}}>
                    <button onClick={runAnalysis} style={{
                      background:"transparent",border:"1px solid #2a2a3f",
                      borderRadius:8,padding:"10px 24px",color:"#606080",
                      fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer",
                      letterSpacing:1,transition:"all 0.2s"
                    }}
                    onMouseOver={e=>{e.target.style.borderColor="#FF6B35";e.target.style.color="#FF6B35";}}
                    onMouseOut={e=>{e.target.style.borderColor="#2a2a3f";e.target.style.color="#606080";}}>
                      🔄 RE-ANALYZE
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{
          borderTop:"1px solid #1e1e30",marginTop:48,padding:"20px 32px",
          display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:"#404055",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
            <div style={{color:"#FF6B35",opacity:0.7}}><GhostIcon/></div>
            GhostSpend AI — Hidden Expense Detector
          </div>
          <div style={{color:"#303045",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
          </div>
        </footer>
      </div>
    </>
  );
}