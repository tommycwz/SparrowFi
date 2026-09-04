import{b as z,c as Y,f as U,h as J,l as H,m as V,o as G}from"./chunk-REIR35Z5.js";import{b as X}from"./chunk-B345O4L3.js";import{Ca as B,Ga as j,Ib as W,Jb as L,Qa as F,Ra as h,Sa as b,Xa as N,eb as f,ib as T,jb as D,kb as A,lb as R,ta as S}from"./chunk-NO5MBLO3.js";var q=class E{constructor(l){this.stateService=l}stateService;selectedMonth=new Date().toISOString().slice(0,7);selectedYear=new Date().getFullYear();generateReport(l){if(!this.selectedMonth){alert("Please select a month and year.");return}let a=this.stateService.state(),n=a.transactions||[],m=this.selectedMonth,C=n.filter(e=>e.date.startsWith(m)),d={},p=0,g={},u=0;for(let e of C)e.type==="income"?(d[e.categoryId]=(d[e.categoryId]||0)+e.amount,p+=e.amount):e.type==="expense"&&(g[e.categoryId]=(g[e.categoryId]||0)+e.amount,u+=e.amount);let M={},O={},v={};for(let e of a.banks)M[e.id]=0;for(let e of a.wallets||[])O[e.id]=0;for(let e of a.cards||[])v[e.id]=0;for(let e of n)e.date.slice(0,7)<=m&&(e.accountType==="bank"&&M[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(M[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(M[e.accountId]-=e.amount)),e.accountType==="wallet"&&O[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(O[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(O[e.accountId]-=e.amount)),e.accountType==="card"&&v[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(v[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(v[e.accountId]-=e.amount)));let w=0;for(let e of a.banks)w+=M[e.id];let _=0;for(let e of a.wallets||[])_+=O[e.id];let x=0;for(let e of a.cards||[])x+=v[e.id];let $=0,P=(a.fixedDeposits||[]).filter(e=>{if(e.startDate.slice(0,7)>m)return!1;if(e.status==="active")return!0;let r=n.find(c=>c.amount===e.amount&&c.type==="others-in"&&c.accountType==="bank"&&c.accountId===(e.toBankId||e.bankId)&&c.date>=e.startDate&&(c.notes.includes("Fixed Deposit Matured")||c.notes.includes("Fixed Deposit Withdrawal")));if(r)return r.date.slice(0,7)>m;let t=new Date(e.startDate);return t.setMonth(t.getMonth()+e.months),t.toISOString().slice(0,7)>m});for(let e of P)$+=e.amount;if(l==="csv"){let e=[];e.push(`Monthly Financial Report,${m}`),e.push(""),e.push("INCOME ANALYSIS"),e.push("Category,Amount,Percentage");for(let r of Object.keys(d)){let t=p>0?d[r]/p*100:0;e.push(`"${this.getCategoryName(r)}",${d[r].toFixed(2)},${t.toFixed(1)}%`)}e.push(`"TOTAL INCOME",${p.toFixed(2)},100.0%`),e.push(""),e.push("EXPENSES ANALYSIS"),e.push("Category,Amount,Percentage");for(let r of Object.keys(g)){let t=u>0?g[r]/u*100:0;e.push(`"${this.getCategoryName(r)}",${g[r].toFixed(2)},${t.toFixed(1)}%`)}e.push(`"TOTAL EXPENSES",${u.toFixed(2)},100.0%`),e.push(""),e.push(`"NET CASH FLOW",${(p-u).toFixed(2)}`),e.push(""),e.push("CURRENT ASSET BALANCES"),e.push("Banks"),e.push("Account Name,Balance");for(let r of a.banks)e.push(`"${r.name}",${M[r.id].toFixed(2)}`);e.push(`"Total Bank Capital",${w.toFixed(2)}`),e.push(""),e.push("Wallets"),e.push("Account Name,Balance");for(let r of a.wallets||[])e.push(`"${r.name}",${O[r.id].toFixed(2)}`);e.push(`"Total Wallet Capital",${_.toFixed(2)}`),e.push(""),e.push("Credit Cards"),e.push("Account Name,Outstanding");for(let r of a.cards||[])e.push(`"${r.name}",${v[r.id].toFixed(2)}`);e.push(`"Total Credit Card Outstanding",${x.toFixed(2)}`),e.push(""),e.push("Fixed Deposits (Active)"),e.push("Bank,Principal,Maturity Date");for(let r of P)e.push(`"${this.getBankName(r.bankId)}",${r.amount.toFixed(2)},${this.getMaturityDate(r).toISOString().split("T")[0]}`);e.push(`"Total Active FDs",${$.toFixed(2)}`),e.push(""),e.push(`"NET ASSET BALANCE",${(w+_+$+x).toFixed(2)}`),this.downloadFile(e.join(`
`),`Financial_Report_${m}.csv`,"text/csv;charset=utf-8;")}else{let e=this.stateService.currencySymbol(),r=s=>{let y=s<0,i=Math.abs(s).toFixed(2);return y?`-${e}${i}`:`${e}${i}`},t=Object.keys(d).map(s=>({label:this.getCategoryName(s),value:Number(d[s].toFixed(2)),color:this.getCategoryColor(s)})),o=Object.keys(g).map(s=>({label:this.getCategoryName(s),value:Number(g[s].toFixed(2)),color:this.getCategoryColor(s)})),c=this.getHtmlTemplate(`Monthly Financial Report - ${m}`);c+=`
        <div class="header">
          <h1>Monthly Financial Report</h1>
          <p>For the period of <strong>${m}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${r(p)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${r(u)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${p>=u?"success":"danger"}">${r(p-u)}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Income Analysis</h2>
            <div class="chart-card">
              <canvas id="incomeChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(d).map(s=>{let y=p>0?d[s]/p*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(s)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${y}%; background-color: ${this.getCategoryColor(s)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${y.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${r(d[s])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(d).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this month</td></tr>':""}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${r(p)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expenses Analysis</h2>
            <div class="chart-card">
              <canvas id="expenseChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(g).map(s=>{let y=u>0?g[s]/u*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(s)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${y}%; background-color: ${this.getCategoryColor(s)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${y.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${r(g[s])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(g).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this month</td></tr>':""}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${r(u)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 3rem;">Current Asset Balances</h2>
        <div class="assets-grid">
          <!-- Banks -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F3E6}</span>
              <h3>Banks</h3>
            </div>
            <table>
              <tbody>
                ${a.banks.map(s=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${s.color||"var(--primary)"};"></span>
                        <span>${s.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${r(M[s.id])}</td>
                  </tr>
                `).join("")}
                ${a.banks.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${r(w)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Wallets -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4BC}</span>
              <h3>Wallets</h3>
            </div>
            <table>
              <tbody>
                ${(a.wallets||[]).map(s=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${s.color||"var(--success)"};"></span>
                        <span>${s.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${r(O[s.id])}</td>
                  </tr>
                `).join("")}
                ${(a.wallets||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${r(_)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Credit Cards -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4B3}</span>
              <h3>Credit Card Expenses</h3>
            </div>
            <table>
              <tbody>
                ${(a.cards||[]).map(s=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${s.color||"var(--danger)"};"></span>
                        <span>${s.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600; color: ${v[s.id]<0?"var(--danger)":"var(--text)"};">
                      ${r(v[s.id])}
                    </td>
                  </tr>
                `).join("")}
                ${(a.cards||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${x<0?"var(--danger)":"var(--text)"};">${r(x)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fixed Deposits -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4B0}</span>
              <h3>Fixed Deposits</h3>
            </div>
            <table>
              <tbody>
                ${P.map(s=>`
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(s.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(s).toISOString().split("T")[0]} (${s.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${r(s.amount)}</td>
                  </tr>
                `).join("")}
                ${P.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Fixed Deposits</td>
                  <td class="right">${r($)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-assets-summary">
          <div class="summary-line">
            <span>Total Liquid Assets (Banks + Wallets)</span>
            <strong>${r(w+_)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${r($)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${r(x)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${w+_+$+x>=0?"success":"danger"}">
              ${r(w+_+$+x)}
            </span>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <script>
          Chart.defaults.color = '#94a3b8';
          Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
          Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

          const incomeData = ${JSON.stringify(t)};
          const expenseData = ${JSON.stringify(o)};

          const drawChart = (canvasId, dataList) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (dataList.length === 0) {
              ctx.font = '14px sans-serif';
              ctx.fillStyle = '#94a3b8';
              ctx.textAlign = 'center';
              ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
              return;
            }
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: dataList.map(x => x.label),
                datasets: [{
                  data: dataList.map(x => x.value),
                  backgroundColor: dataList.map(x => x.color),
                  borderWidth: 2,
                  borderColor: '#1e293b'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 8,
                      padding: 8,
                      font: { size: 10 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ' ' + context.label + ': ' + '${e}' + context.raw.toFixed(2)
                    }
                  }
                },
                cutout: '65%'
              }
            });
          };

          drawChart('incomeChart', incomeData);
          drawChart('expenseChart', expenseData);
        <\/script>
      </body>
      </html>`,this.openHtmlWindow(c,l==="pdf")}}generateAnnualReport(l){if(!this.selectedYear){alert("Please select a year.");return}let a=this.selectedYear.toString(),n=this.stateService.state(),m=n.transactions||[],C=m.filter(t=>t.date.startsWith(a)),d={},p=0,g={},u=0;for(let t of C)t.type==="income"?(d[t.categoryId]=(d[t.categoryId]||0)+t.amount,p+=t.amount):t.type==="expense"&&(g[t.categoryId]=(g[t.categoryId]||0)+t.amount,u+=t.amount);let M={},O={},v={};for(let t of n.banks)M[t.id]=0;for(let t of n.wallets||[])O[t.id]=0;for(let t of n.cards||[])v[t.id]=0;for(let t of m)t.date.slice(0,4)<=a&&(t.accountType==="bank"&&M[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(M[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(M[t.accountId]-=t.amount)),t.accountType==="wallet"&&O[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(O[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(O[t.accountId]-=t.amount)),t.accountType==="card"&&v[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(v[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(v[t.accountId]-=t.amount)));let w=0;for(let t of n.banks)w+=M[t.id];let _=0;for(let t of n.wallets||[])_+=O[t.id];let x=0;for(let t of n.cards||[])x+=v[t.id];let $=0,P=(n.fixedDeposits||[]).filter(t=>{if(t.startDate.slice(0,4)>a)return!1;if(t.status==="active")return!0;let o=m.find(y=>y.amount===t.amount&&y.type==="others-in"&&y.accountType==="bank"&&y.accountId===(t.toBankId||t.bankId)&&y.date>=t.startDate&&(y.notes.includes("Fixed Deposit Matured")||y.notes.includes("Fixed Deposit Withdrawal")));if(o)return o.date.slice(0,4)>a;let c=new Date(t.startDate);return c.setMonth(c.getMonth()+t.months),c.getFullYear().toString()>a});for(let t of P)$+=t.amount;let e=Array(12).fill(0),r=Array(12).fill(0);for(let t of C){let o=t.date.split("-");if(o.length>=2){let c=parseInt(o[1],10)-1;c>=0&&c<12&&(t.type==="income"?e[c]+=t.amount:t.type==="expense"&&(r[c]+=t.amount))}}if(l==="csv"){let t=[];t.push(`Annual Summary Report,${a}`),t.push(""),t.push("INCOME ANALYSIS"),t.push("Category,Amount,Percentage");for(let o of Object.keys(d)){let c=p>0?d[o]/p*100:0;t.push(`"${this.getCategoryName(o)}",${d[o].toFixed(2)},${c.toFixed(1)}%`)}t.push(`"TOTAL INCOME",${p.toFixed(2)},100.0%`),t.push(""),t.push("EXPENSES ANALYSIS"),t.push("Category,Amount,Percentage");for(let o of Object.keys(g)){let c=u>0?g[o]/u*100:0;t.push(`"${this.getCategoryName(o)}",${g[o].toFixed(2)},${c.toFixed(1)}%`)}t.push(`"TOTAL EXPENSES",${u.toFixed(2)},100.0%`),t.push(""),t.push(`"NET CASH FLOW",${(p-u).toFixed(2)}`),t.push(""),t.push("CURRENT ASSET BALANCES"),t.push("Banks"),t.push("Account Name,Balance");for(let o of n.banks)t.push(`"${o.name}",${M[o.id].toFixed(2)}`);t.push(`"Total Bank Capital",${w.toFixed(2)}`),t.push(""),t.push("Wallets"),t.push("Account Name,Balance");for(let o of n.wallets||[])t.push(`"${o.name}",${O[o.id].toFixed(2)}`);t.push(`"Total Wallet Capital",${_.toFixed(2)}`),t.push(""),t.push("Credit Cards"),t.push("Account Name,Outstanding");for(let o of n.cards||[])t.push(`"${o.name}",${v[o.id].toFixed(2)}`);t.push(`"Total Credit Card Outstanding",${x.toFixed(2)}`),t.push(""),t.push("Fixed Deposits (Active)"),t.push("Bank,Principal,Maturity Date");for(let o of P)t.push(`"${this.getBankName(o.bankId)}",${o.amount.toFixed(2)},${this.getMaturityDate(o).toISOString().split("T")[0]}`);t.push(`"Total Active FDs",${$.toFixed(2)}`),t.push(""),t.push(`"NET ASSET BALANCE",${(w+_+$+x).toFixed(2)}`),this.downloadFile(t.join(`
`),`Annual_Summary_${a}.csv`,"text/csv;charset=utf-8;")}else{let t=this.stateService.currencySymbol(),o=i=>{let k=i<0,I=Math.abs(i).toFixed(2);return k?`-${t}${I}`:`${t}${I}`},c=Object.keys(d).map(i=>({label:this.getCategoryName(i),value:Number(d[i].toFixed(2)),color:this.getCategoryColor(i)})),s=Object.keys(g).map(i=>({label:this.getCategoryName(i),value:Number(g[i].toFixed(2)),color:this.getCategoryColor(i)})),y=this.getHtmlTemplate(`Annual Summary - ${a}`);y+=`
        <div class="header">
          <h1>Annual Financial Summary</h1>
          <p>For the year of <strong>${a}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${o(p)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${o(u)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${p>=u?"success":"danger"}">${o(p-u)}</div>
          </div>
        </div>

        <!-- Annual Trend Bar Chart -->
        <h2 class="section-title">Monthly Income vs Expenses Trend</h2>
        <div class="chart-card" style="height: 320px; margin-bottom: 2.5rem; display: block; width: 100%;">
          <canvas id="trendChart" style="width: 100%; height: 100%;"></canvas>
        </div>

        <div class="grid">
          <div>
            <h2 class="section-title">Income Analysis</h2>
            <div class="chart-card">
              <canvas id="incomeChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(d).map(i=>{let k=p>0?d[i]/p*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(i)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${k}%; background-color: ${this.getCategoryColor(i)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${k.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${o(d[i])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(d).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this year</td></tr>':""}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${o(p)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h2 class="section-title">Expenses Analysis</h2>
            <div class="chart-card">
              <canvas id="expenseChart"></canvas>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="right" style="width: 25%;">Percentage</th>
                  <th class="right" style="width: 30%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(g).map(i=>{let k=u>0?g[i]/u*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(i)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${k}%; background-color: ${this.getCategoryColor(i)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${k.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${o(g[i])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(g).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this year</td></tr>':""}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${o(u)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 class="section-title" style="margin-top: 3rem;">Current Asset Balances</h2>
        <div class="assets-grid">
          <!-- Banks -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F3E6}</span>
              <h3>Banks</h3>
            </div>
            <table>
              <tbody>
                ${n.banks.map(i=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${i.color||"var(--primary)"};"></span>
                        <span>${i.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${o(M[i.id])}</td>
                  </tr>
                `).join("")}
                ${n.banks.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${o(w)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Wallets -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4BC}</span>
              <h3>Wallets</h3>
            </div>
            <table>
              <tbody>
                ${(n.wallets||[]).map(i=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${i.color||"var(--success)"};"></span>
                        <span>${i.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${o(O[i.id])}</td>
                  </tr>
                `).join("")}
                ${(n.wallets||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${o(_)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Credit Cards -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4B3}</span>
              <h3>Credit Card Expenses</h3>
            </div>
            <table>
              <tbody>
                ${(n.cards||[]).map(i=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${i.color||"var(--danger)"};"></span>
                        <span>${i.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600; color: ${v[i.id]<0?"var(--danger)":"var(--text)"};">
                      ${o(v[i.id])}
                    </td>
                  </tr>
                `).join("")}
                ${(n.cards||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${x<0?"var(--danger)":"var(--text)"};">${o(x)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fixed Deposits -->
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-icon">\u{1F4B0}</span>
              <h3>Fixed Deposits</h3>
            </div>
            <table>
              <tbody>
                ${P.map(i=>`
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(i.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(i).toISOString().split("T")[0]} (${i.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${o(i.amount)}</td>
                  </tr>
                `).join("")}
                ${P.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Fixed Deposits</td>
                  <td class="right">${o($)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-assets-summary">
          <div class="summary-line">
            <span>Total Liquid Assets (Banks + Wallets)</span>
            <strong>${o(w+_)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${o($)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${o(x)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${w+_+$+x>=0?"success":"danger"}">
              ${o(w+_+$+x)}
            </span>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <script>
          Chart.defaults.color = '#94a3b8';
          Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
          Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

          const incomeData = ${JSON.stringify(c)};
          const expenseData = ${JSON.stringify(s)};
          const monthlyIncome = ${JSON.stringify(e)};
          const monthlyExpense = ${JSON.stringify(r)};

          const drawChart = (canvasId, dataList) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (dataList.length === 0) {
              ctx.font = '14px sans-serif';
              ctx.fillStyle = '#94a3b8';
              ctx.textAlign = 'center';
              ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
              return;
            }
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: dataList.map(x => x.label),
                datasets: [{
                  data: dataList.map(x => x.value),
                  backgroundColor: dataList.map(x => x.color),
                  borderWidth: 2,
                  borderColor: '#1e293b'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 8,
                      padding: 8,
                      font: { size: 10 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => ' ' + context.label + ': ' + '${t}' + context.raw.toFixed(2)
                    }
                  }
                },
                cutout: '65%'
              }
            });
          };

          drawChart('incomeChart', incomeData);
          drawChart('expenseChart', expenseData);

          // Render Annual Grouped Bar Chart
          const trendCtx = document.getElementById('trendChart').getContext('2d');
          new Chart(trendCtx, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Income',
                  data: monthlyIncome,
                  backgroundColor: '#22c55e',
                  borderRadius: 4
                },
                {
                  label: 'Expenses',
                  data: monthlyExpense,
                  backgroundColor: '#ef4444',
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                  grid: { display: false }
                }
              },
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context) => ' ' + context.dataset.label + ': ' + '${t}' + context.raw.toFixed(2)
                  }
                }
              }
            }
          });
        <\/script>
      </body>
      </html>`,this.openHtmlWindow(y,l==="pdf")}}openHtmlWindow(l,a){let n=window.open("","_blank");n?(n.document.write(l),n.document.close(),a&&(n.focus(),setTimeout(()=>{n.print()},250))):alert("Your browser blocked the popup. Please enable popups to generate reports.")}downloadFile(l,a,n){let m=new Blob([l],{type:n}),C=URL.createObjectURL(m),d=document.createElement("a");d.href=C,d.download=a,d.click(),URL.revokeObjectURL(C)}getHtmlTemplate(l){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${l}</title>
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
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
      margin-bottom: 1.5rem;
      margin-top: 2rem;
      color: var(--primary);
      font-size: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(255, 255, 255, 0.04);
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
    .progress-container {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      height: 6px;
      margin-top: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .asset-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .asset-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    .asset-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .asset-icon {
      font-size: 1.3rem;
    }
    .color-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .asset-total-row {
      font-weight: bold;
      background: rgba(255, 255, 255, 0.02);
    }
    .asset-total-row td {
      color: var(--primary) !important;
      border-top: 1px solid var(--border);
    }
    .net-assets-summary {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 500px;
      margin-left: auto;
      margin-top: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .summary-line strong {
      color: var(--text);
    }
    .summary-line.grand-total {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px dashed var(--border);
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--text);
    }
    .grand-total .success {
      color: var(--success);
    }
    .grand-total .danger {
      color: var(--danger);
    }
    @media print {
      body {
        padding: 0;
        background: transparent !important;
        color: #000000 !important;
      }
      .card { page-break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .chart-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>`}getCategoryName(l){let a=this.stateService.state().categories.find(n=>n.id===l);return a?a.name:"Unknown Category"}getCategoryColor(l){let a=this.stateService.state().categories.find(n=>n.id===l);return a&&a.color||"#3b82f6"}getBankName(l){let a=this.stateService.state().banks.find(n=>n.id===l);return a?a.name:"Unknown Bank"}getMaturityDate(l){let a=new Date(l.startDate);return a.setMonth(a.getMonth()+l.months),a}static \u0275fac=function(a){return new(a||E)(B(X))};static \u0275cmp=j({type:E,selectors:[["app-report"]],features:[R([W])],decls:53,vars:6,consts:[[1,"module-container"],[1,"module-header"],[1,"title-area"],[1,"page-title"],[1,"subtitle"],[1,"report-grid"],[1,"report-card","glass-card"],[1,"report-icon"],[1,"report-details"],[1,"report-actions"],[1,"input-group"],["type","month",3,"ngModelChange","ngModel"],[1,"button-group"],[1,"row-group"],["title","Open report in new tab",1,"btn-action",3,"click","disabled"],["title","Download or print as PDF",1,"btn-primary",3,"click","disabled"],["type","number","min","2000","max","2100","step","1",3,"ngModelChange","ngModel"]],template:function(a,n){a&1&&(h(0,"div",0)(1,"header",1)(2,"div",2)(3,"div")(4,"h1",3),f(5,"Reports"),b(),h(6,"p",4),f(7,"Generate detailed financial reports and "),h(8,"span"),f(9,"track your progress"),b()()()()(),h(10,"div",5)(11,"div",6)(12,"div",7),f(13,"\u{1F4CA}"),b(),h(14,"div",8)(15,"h2"),f(16,"Monthly Financial Report"),b(),h(17,"p"),f(18,"A comprehensive report showing income, expenses, and your current asset balances including Banks, Wallets, and Fixed Deposits."),b(),h(19,"div",9)(20,"div",10)(21,"label"),f(22,"Select Month"),b(),h(23,"input",11),A("ngModelChange",function(C){return D(n.selectedMonth,C)||(n.selectedMonth=C),C}),b()(),h(24,"div",12)(25,"div",13)(26,"button",14),N("click",function(){return n.generateReport("view")}),h(27,"span"),f(28,"\u{1F441}\uFE0F"),b(),f(29," View "),b(),h(30,"button",15),N("click",function(){return n.generateReport("pdf")}),f(31," Generate as PDF "),b()()()()()(),h(32,"div",6)(33,"div",7),f(34,"\u{1F4C8}"),b(),h(35,"div",8)(36,"h2"),f(37,"Annual Summary"),b(),h(38,"p"),f(39,"Year-end review of your income and major spending categories for the selected year."),b(),h(40,"div",9)(41,"div",10)(42,"label"),f(43,"Select Year"),b(),h(44,"input",16),A("ngModelChange",function(C){return D(n.selectedYear,C)||(n.selectedYear=C),C}),b()(),h(45,"div",12)(46,"div",13)(47,"button",14),N("click",function(){return n.generateAnnualReport("view")}),h(48,"span"),f(49,"\u{1F441}\uFE0F"),b(),f(50," View "),b(),h(51,"button",15),N("click",function(){return n.generateAnnualReport("pdf")}),f(52," Generate as PDF "),b()()()()()()()()),a&2&&(S(23),T("ngModel",n.selectedMonth),S(3),F("disabled",!n.selectedMonth),S(4),F("disabled",!n.selectedMonth),S(14),T("ngModel",n.selectedYear),S(3),F("disabled",!n.selectedYear),S(4),F("disabled",!n.selectedYear))},dependencies:[L,G,z,J,Y,V,H,U],styles:[".report-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(350px,100%),1fr));gap:2rem;margin-top:2rem}.report-card[_ngcontent-%COMP%]{min-width:0;display:flex;flex-direction:column;padding:2rem;transition:transform .3s ease,box-shadow .3s ease;position:relative;overflow:hidden}.report-card[_ngcontent-%COMP%]:hover:not(.placeholder){transform:translateY(-5px);box-shadow:0 15px 30px -10px #0000004d;border-color:#4facfe66}.report-card.placeholder[_ngcontent-%COMP%]{opacity:.6}.report-card.placeholder[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{filter:grayscale(1)}.report-card[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{font-size:3rem;margin-bottom:1.5rem;background:#ffffff0d;width:70px;height:70px;display:flex;align-items:center;justify-content:center;border-radius:16px;border:1px solid rgba(255,255,255,.1)}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]{min-width:0;display:flex;flex-direction:column;flex:1}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0 0 .5rem;font-size:1.3rem;color:#fff}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#94a3b8;font-size:.95rem;line-height:1.6;margin:0 0 2rem;flex:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1.5rem;background:#0003;padding:1.5rem;border-radius:12px;border:1px solid rgba(255,255,255,.05)}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:.85rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%], .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]{padding:.75rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#ffffff0d;color:#fff;font-family:inherit;font-size:1rem;transition:all .2s;width:100%;box-sizing:border-box}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]:focus, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]:focus{outline:none;border-color:#4facfe;background:#ffffff1a}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button{filter:invert(1);opacity:.5;cursor:pointer}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover{opacity:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .row-group[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.75rem;width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{flex:1;padding:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:.95rem;font-weight:500;font-family:inherit;border-radius:8px;cursor:pointer;transition:all .2s ease;white-space:nowrap}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:1.1rem;line-height:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .full-width[_ngcontent-%COMP%]{width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%]{background:linear-gradient(135deg,#4facfe,#00f2fe);border:none;color:#0f172a;font-weight:600}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%]:hover{filter:brightness(1.1);box-shadow:0 4px 12px #4facfe4d}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-action[_ngcontent-%COMP%]{background:#ffffff0d;border:1px solid rgba(255,255,255,.1);color:#f8fafc}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-action[_ngcontent-%COMP%]:hover{background:#ffffff1f;border-color:#fff3}@media(max-width:480px){.report-grid[_ngcontent-%COMP%]{gap:1rem}.report-card[_ngcontent-%COMP%]{padding:1.25rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]{padding:1rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .row-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{white-space:normal}}"]})};export{q as ReportComponent};
