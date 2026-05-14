import{b as F,c as T,f as A,h as D,l as N,m as I,o as R}from"./chunk-N4DSGYUU.js";import{b as B}from"./chunk-LXGCTAA5.js";import{Ca as k,Ga as S,Jb as w,Kb as E,Qa as M,Ra as o,Sa as c,Xa as v,eb as l,ib as _,jb as O,kb as P,lb as $,ta as C}from"./chunk-GJ2R2R53.js";var j=class x{constructor(p){this.stateService=p}stateService;selectedMonth=new Date().toISOString().slice(0,7);selectedYear=new Date().getFullYear();generateReport(p){if(!this.selectedMonth){alert("Please select a month and year.");return}let n=this.stateService.state(),r=n.transactions||[],u=this.selectedMonth,f=r.filter(t=>t.date.startsWith(u)),g={},m=0,b={},h=0;for(let t of f)t.type==="income"?(g[t.categoryId]=(g[t.categoryId]||0)+t.amount,m+=t.amount):t.type==="expense"&&(b[t.categoryId]=(b[t.categoryId]||0)+t.amount,h+=t.amount);let e={},a={};for(let t of n.banks)e[t.id]=0;for(let t of n.wallets||[])a[t.id]=0;for(let t of r)t.accountType==="bank"&&e[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(e[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(e[t.accountId]-=t.amount)),t.accountType==="wallet"&&a[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(a[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(a[t.accountId]-=t.amount));if(p==="csv"){let t=[];t.push(`Monthly Financial Report,${u}`),t.push(""),t.push("INCOME"),t.push("Category,Amount");for(let d of Object.keys(g))t.push(`"${this.getCategoryName(d)}",${g[d].toFixed(2)}`);t.push(`"TOTAL INCOME",${m.toFixed(2)}`),t.push(""),t.push("EXPENSES"),t.push("Category,Amount");for(let d of Object.keys(b))t.push(`"${this.getCategoryName(d)}",${b[d].toFixed(2)}`);t.push(`"TOTAL EXPENSES",${h.toFixed(2)}`),t.push(""),t.push(`"NET CASH FLOW",${(m-h).toFixed(2)}`),t.push(""),t.push(""),t.push("CURRENT ASSET BALANCES"),t.push(""),t.push("Banks"),t.push("Account Name,Balance");let i=0;for(let d of n.banks)t.push(`"${d.name}",${e[d.id].toFixed(2)}`),i+=e[d.id];t.push(`"Total Bank Capital",${i.toFixed(2)}`),t.push(""),t.push("Wallets"),t.push("Account Name,Balance");let y=0;for(let d of n.wallets||[])t.push(`"${d.name}",${a[d.id].toFixed(2)}`),y+=a[d.id];t.push(`"Total Wallet Capital",${y.toFixed(2)}`),t.push(""),t.push("Fixed Deposits (Active)"),t.push("Bank,Principal,Maturity Date");let s=0,W=(n.fixedDeposits||[]).filter(d=>d.status==="active");for(let d of W)t.push(`"${this.getBankName(d.bankId)}",${d.amount.toFixed(2)},${this.getMaturityDate(d).toISOString().split("T")[0]}`),s+=d.amount;t.push(`"Total Active FDs",${s.toFixed(2)}`),this.downloadFile(t.join(`
`),`Financial_Report_${u}.csv`,"text/csv;charset=utf-8;")}else{let t=this.stateService.currencySymbol(),i=s=>`${t}${s.toFixed(2)}`,y=this.getHtmlTemplate(`Monthly Financial Report - ${u}`);y+=`
        <div class="header">
          <h1>Monthly Financial Report</h1>
          <p>For the period of <strong>${u}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${i(m)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${i(h)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${m>=h?"success":"danger"}">${i(m-h)}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Income Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(g).map(s=>`<tr><td>${this.getCategoryName(s)}</td><td class="right">${i(g[s])}</td></tr>`).join("")}
              <tr class="total-row"><td>Total</td><td class="right">${i(m)}</td></tr>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expense Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(b).map(s=>`<tr><td>${this.getCategoryName(s)}</td><td class="right">${i(b[s])}</td></tr>`).join("")}
              <tr class="total-row"><td>Total</td><td class="right">${i(h)}</td></tr>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 2rem;">Current Asset Balances</h2>
        <div class="grid">
          <div>
            <h3>Banks</h3>
            <table>
              <tr><th>Account Name</th><th class="right">Balance</th></tr>
              ${n.banks.map(s=>`<tr><td>${s.name}</td><td class="right">${i(e[s.id])}</td></tr>`).join("")}
            </table>
          </div>
          <div>
            <h3>Wallets & Fixed Deposits</h3>
            <table>
              <tr><th>Wallet Name</th><th class="right">Balance</th></tr>
              ${(n.wallets||[]).map(s=>`<tr><td>${s.name}</td><td class="right">${i(a[s.id])}</td></tr>`).join("")}
            </table>
            <br>
            <table>
              <tr><th>Active FD Bank</th><th class="right">Principal</th></tr>
              ${(n.fixedDeposits||[]).filter(s=>s.status==="active").map(s=>`<tr><td>${this.getBankName(s.bankId)}</td><td class="right">${i(s.amount)}</td></tr>`).join("")}
            </table>
          </div>
        </div>
      </body>
      </html>`,this.downloadFile(y,`Financial_Report_${u}.html`,"text/html;charset=utf-8;")}}generateAnnualReport(p){if(!this.selectedYear){alert("Please select a year.");return}let n=this.selectedYear.toString(),f=(this.stateService.state().transactions||[]).filter(e=>e.date.startsWith(n)),g={},m=0,b={},h=0;for(let e of f)e.type==="income"?(g[e.categoryId]=(g[e.categoryId]||0)+e.amount,m+=e.amount):e.type==="expense"&&(b[e.categoryId]=(b[e.categoryId]||0)+e.amount,h+=e.amount);if(p==="csv"){let e=[];e.push(`Annual Summary Report,${n}`),e.push(""),e.push("INCOME"),e.push("Category,Amount");for(let a of Object.keys(g))e.push(`"${this.getCategoryName(a)}",${g[a].toFixed(2)}`);e.push(`"TOTAL INCOME",${m.toFixed(2)}`),e.push(""),e.push("EXPENSES"),e.push("Category,Amount");for(let a of Object.keys(b))e.push(`"${this.getCategoryName(a)}",${b[a].toFixed(2)}`);e.push(`"TOTAL EXPENSES",${h.toFixed(2)}`),e.push(""),e.push(`"NET CASH FLOW",${(m-h).toFixed(2)}`),this.downloadFile(e.join(`
`),`Annual_Summary_${n}.csv`,"text/csv;charset=utf-8;")}else{let e=this.stateService.currencySymbol(),a=i=>`${e}${i.toFixed(2)}`,t=this.getHtmlTemplate(`Annual Summary - ${n}`);t+=`
        <div class="header">
          <h1>Annual Financial Summary</h1>
          <p>For the year of <strong>${n}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${a(m)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${a(h)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${m>=h?"success":"danger"}">${a(m-h)}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Annual Income Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(g).map(i=>`<tr><td>${this.getCategoryName(i)}</td><td class="right">${a(g[i])}</td></tr>`).join("")}
              <tr class="total-row"><td>Total</td><td class="right">${a(m)}</td></tr>
            </table>
          </div>
          <div>
            <h2 class="section-title">Annual Expense Breakdown</h2>
            <table>
              <tr><th>Category</th><th class="right">Amount</th></tr>
              ${Object.keys(b).map(i=>`<tr><td>${this.getCategoryName(i)}</td><td class="right">${a(b[i])}</td></tr>`).join("")}
              <tr class="total-row"><td>Total</td><td class="right">${a(h)}</td></tr>
            </table>
          </div>
        </div>
      </body>
      </html>`,this.downloadFile(t,`Annual_Summary_${n}.html`,"text/html;charset=utf-8;")}}downloadFile(p,n,r){let u=new Blob([p],{type:r}),f=URL.createObjectURL(u),g=document.createElement("a");g.href=f,g.download=n,g.click(),URL.revokeObjectURL(f)}getHtmlTemplate(p){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p}</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --primary: #3b82f6;
      --success: #22c55e;
      --danger: #ef4444;
    }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .header h1 {
      margin: 0;
      color: var(--primary);
      font-size: 2.5rem;
    }
    .header p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    .card.highlight {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }
    .card h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-muted);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card .amount {
      font-size: 2rem;
      font-weight: bold;
    }
    .amount.success { color: var(--success); }
    .amount.danger { color: var(--danger); }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
    }
    .section-title {
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      font-weight: 600;
    }
    td.right, th.right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      background: rgba(255, 255, 255, 0.02);
    }
    .total-row td {
      border-bottom: none;
      color: var(--primary);
    }
  </style>
</head>
<body>`}getCategoryName(p){let n=this.stateService.state().categories.find(r=>r.id===p);return n?n.name:"Unknown Category"}getBankName(p){let n=this.stateService.state().banks.find(r=>r.id===p);return n?n.name:"Unknown Bank"}getMaturityDate(p){let n=new Date(p.startDate);return n.setMonth(n.getMonth()+p.months),n}static \u0275fac=function(n){return new(n||x)(k(B))};static \u0275cmp=S({type:x,selectors:[["app-report"]],features:[$([w])],decls:55,vars:6,consts:[[1,"module-container"],[1,"module-header"],[1,"title-area"],[1,"page-title"],[1,"subtitle"],[1,"report-grid"],[1,"report-card","glass-card"],[1,"report-icon"],[1,"report-details"],[1,"report-actions"],[1,"input-group"],["type","month",3,"ngModelChange","ngModel"],[1,"button-group"],[1,"btn-primary",3,"click","disabled"],[1,"btn-secondary",3,"click","disabled"],["type","number","min","2000","max","2100","step","1",3,"ngModelChange","ngModel"]],template:function(n,r){n&1&&(o(0,"div",0)(1,"header",1)(2,"div",2)(3,"div")(4,"h1",3),l(5,"Reports"),c(),o(6,"p",4),l(7,"Generate detailed financial reports and "),o(8,"span"),l(9,"track your progress"),c()()()()(),o(10,"div",5)(11,"div",6)(12,"div",7),l(13,"\u{1F4CA}"),c(),o(14,"div",8)(15,"h2"),l(16,"Monthly Financial Report"),c(),o(17,"p"),l(18,"A comprehensive report showing income, expenses, and your current asset balances including Banks, Wallets, and Fixed Deposits."),c(),o(19,"div",9)(20,"div",10)(21,"label"),l(22,"Select Month"),c(),o(23,"input",11),P("ngModelChange",function(f){return O(r.selectedMonth,f)||(r.selectedMonth=f),f}),c()(),o(24,"div",12)(25,"button",13),v("click",function(){return r.generateReport("html")}),o(26,"span"),l(27,"\u{1F4C4}"),c(),l(28," HTML "),c(),o(29,"button",14),v("click",function(){return r.generateReport("csv")}),o(30,"span"),l(31,"\u{1F4CA}"),c(),l(32," CSV "),c()()()()(),o(33,"div",6)(34,"div",7),l(35,"\u{1F4C8}"),c(),o(36,"div",8)(37,"h2"),l(38,"Annual Summary"),c(),o(39,"p"),l(40,"Year-end review of your income and major spending categories for the selected year."),c(),o(41,"div",9)(42,"div",10)(43,"label"),l(44,"Select Year"),c(),o(45,"input",15),P("ngModelChange",function(f){return O(r.selectedYear,f)||(r.selectedYear=f),f}),c()(),o(46,"div",12)(47,"button",13),v("click",function(){return r.generateAnnualReport("html")}),o(48,"span"),l(49,"\u{1F4C4}"),c(),l(50," HTML "),c(),o(51,"button",14),v("click",function(){return r.generateAnnualReport("csv")}),o(52,"span"),l(53,"\u{1F4CA}"),c(),l(54," CSV "),c()()()()()()()),n&2&&(C(23),_("ngModel",r.selectedMonth),C(2),M("disabled",!r.selectedMonth),C(4),M("disabled",!r.selectedMonth),C(16),_("ngModel",r.selectedYear),C(2),M("disabled",!r.selectedYear),C(4),M("disabled",!r.selectedYear))},dependencies:[E,R,F,D,T,I,N,A],styles:[".report-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:2rem;margin-top:2rem}.report-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:2rem;transition:transform .3s ease,box-shadow .3s ease;position:relative;overflow:hidden}.report-card[_ngcontent-%COMP%]:hover:not(.placeholder){transform:translateY(-5px);box-shadow:0 15px 30px -10px #0000004d;border-color:#4facfe66}.report-card.placeholder[_ngcontent-%COMP%]{opacity:.6}.report-card.placeholder[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{filter:grayscale(1)}.report-card[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{font-size:3rem;margin-bottom:1.5rem;background:#ffffff0d;width:70px;height:70px;display:flex;align-items:center;justify-content:center;border-radius:16px;border:1px solid rgba(255,255,255,.1)}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0 0 .5rem;font-size:1.3rem;color:#fff}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#94a3b8;font-size:.95rem;line-height:1.6;margin:0 0 2rem;flex:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1.5rem;background:#0003;padding:1.5rem;border-radius:12px;border:1px solid rgba(255,255,255,.05)}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:.85rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%], .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]{padding:.75rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#ffffff0d;color:#fff;font-family:inherit;font-size:1rem;transition:all .2s;width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]:focus, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]:focus{outline:none;border-color:#4facfe;background:#ffffff1a}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button{filter:invert(1);opacity:.5;cursor:pointer}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover{opacity:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]{display:flex;gap:1rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{flex:1;padding:.85rem;display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:1rem}"]})};export{j as ReportComponent};
