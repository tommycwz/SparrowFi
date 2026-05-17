import{b as z,c as Y,f as U,h as J,l as H,m as V,o as G}from"./chunk-REIR35Z5.js";import{b as X}from"./chunk-B345O4L3.js";import{Ca as B,Ga as j,Ib as L,Jb as W,Qa as F,Ra as u,Sa as m,Xa as N,eb as h,ib as A,jb as T,kb as D,lb as R,ta as k}from"./chunk-NO5MBLO3.js";var q=class E{constructor(c){this.stateService=c}stateService;selectedMonth=new Date().toISOString().slice(0,7);selectedYear=new Date().getFullYear();generateReport(c){if(!this.selectedMonth){alert("Please select a month and year.");return}let a=this.stateService.state(),n=a.transactions||[],v=this.selectedMonth,y=n.filter(e=>e.date.startsWith(v)),d={},l=0,p={},g=0;for(let e of y)e.type==="income"?(d[e.categoryId]=(d[e.categoryId]||0)+e.amount,l+=e.amount):e.type==="expense"&&(p[e.categoryId]=(p[e.categoryId]||0)+e.amount,g+=e.amount);let x={},C={},b={};for(let e of a.banks)x[e.id]=0;for(let e of a.wallets||[])C[e.id]=0;for(let e of a.cards||[])b[e.id]=0;for(let e of n)e.accountType==="bank"&&x[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(x[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(x[e.accountId]-=e.amount)),e.accountType==="wallet"&&C[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(C[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(C[e.accountId]-=e.amount)),e.accountType==="card"&&b[e.accountId]!==void 0&&((e.type==="income"||e.type==="others-in")&&(b[e.accountId]+=e.amount),(e.type==="expense"||e.type==="others-out")&&(b[e.accountId]-=e.amount));let M=0;for(let e of a.banks)M+=x[e.id];let O=0;for(let e of a.wallets||[])O+=C[e.id];let f=0;for(let e of a.cards||[])f+=b[e.id];let $=0,S=(a.fixedDeposits||[]).filter(e=>e.status==="active");for(let e of S)$+=e.amount;if(c==="csv"){let e=[];e.push(`Monthly Financial Report,${v}`),e.push(""),e.push("INCOME ANALYSIS"),e.push("Category,Amount,Percentage");for(let i of Object.keys(d)){let t=l>0?d[i]/l*100:0;e.push(`"${this.getCategoryName(i)}",${d[i].toFixed(2)},${t.toFixed(1)}%`)}e.push(`"TOTAL INCOME",${l.toFixed(2)},100.0%`),e.push(""),e.push("EXPENSES ANALYSIS"),e.push("Category,Amount,Percentage");for(let i of Object.keys(p)){let t=g>0?p[i]/g*100:0;e.push(`"${this.getCategoryName(i)}",${p[i].toFixed(2)},${t.toFixed(1)}%`)}e.push(`"TOTAL EXPENSES",${g.toFixed(2)},100.0%`),e.push(""),e.push(`"NET CASH FLOW",${(l-g).toFixed(2)}`),e.push(""),e.push("CURRENT ASSET BALANCES"),e.push("Banks"),e.push("Account Name,Balance");for(let i of a.banks)e.push(`"${i.name}",${x[i.id].toFixed(2)}`);e.push(`"Total Bank Capital",${M.toFixed(2)}`),e.push(""),e.push("Wallets"),e.push("Account Name,Balance");for(let i of a.wallets||[])e.push(`"${i.name}",${C[i.id].toFixed(2)}`);e.push(`"Total Wallet Capital",${O.toFixed(2)}`),e.push(""),e.push("Credit Cards"),e.push("Account Name,Outstanding");for(let i of a.cards||[])e.push(`"${i.name}",${b[i.id].toFixed(2)}`);e.push(`"Total Credit Card Outstanding",${f.toFixed(2)}`),e.push(""),e.push("Fixed Deposits (Active)"),e.push("Bank,Principal,Maturity Date");for(let i of S)e.push(`"${this.getBankName(i.bankId)}",${i.amount.toFixed(2)},${this.getMaturityDate(i).toISOString().split("T")[0]}`);e.push(`"Total Active FDs",${$.toFixed(2)}`),e.push(""),e.push(`"NET ASSET BALANCE",${(M+O+$+f).toFixed(2)}`),this.downloadFile(e.join(`
`),`Financial_Report_${v}.csv`,"text/csv;charset=utf-8;")}else{let e=this.stateService.currencySymbol(),i=s=>{let _=s<0,r=Math.abs(s).toFixed(2);return _?`-${e}${r}`:`${e}${r}`},t=Object.keys(d).map(s=>({label:this.getCategoryName(s),value:Number(d[s].toFixed(2)),color:this.getCategoryColor(s)})),o=Object.keys(p).map(s=>({label:this.getCategoryName(s),value:Number(p[s].toFixed(2)),color:this.getCategoryColor(s)})),w=this.getHtmlTemplate(`Monthly Financial Report - ${v}`);w+=`
        <div class="header">
          <h1>Monthly Financial Report</h1>
          <p>For the period of <strong>${v}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${i(l)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${i(g)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${l>=g?"success":"danger"}">${i(l-g)}</div>
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
                ${Object.keys(d).map(s=>{let _=l>0?d[s]/l*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(s)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${_}%; background-color: ${this.getCategoryColor(s)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${_.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${i(d[s])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(d).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this month</td></tr>':""}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${i(l)}</td>
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
                ${Object.keys(p).map(s=>{let _=g>0?p[s]/g*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(s)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${_}%; background-color: ${this.getCategoryColor(s)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${_.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${i(p[s])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(p).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this month</td></tr>':""}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${i(g)}</td>
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
                    <td class="right" style="font-weight: 600;">${i(x[s.id])}</td>
                  </tr>
                `).join("")}
                ${a.banks.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${i(M)}</td>
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
                    <td class="right" style="font-weight: 600;">${i(C[s.id])}</td>
                  </tr>
                `).join("")}
                ${(a.wallets||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${i(O)}</td>
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
                    <td class="right" style="font-weight: 600; color: ${b[s.id]<0?"var(--danger)":"var(--text)"};">
                      ${i(b[s.id])}
                    </td>
                  </tr>
                `).join("")}
                ${(a.cards||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${f<0?"var(--danger)":"var(--text)"};">${i(f)}</td>
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
                ${(a.fixedDeposits||[]).filter(s=>s.status==="active").map(s=>`
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(s.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(s).toISOString().split("T")[0]} (${s.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${i(s.amount)}</td>
                  </tr>
                `).join("")}
                ${(a.fixedDeposits||[]).filter(s=>s.status==="active").length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Fixed Deposits</td>
                  <td class="right">${i($)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="net-assets-summary">
          <div class="summary-line">
            <span>Total Liquid Assets (Banks + Wallets)</span>
            <strong>${i(M+O)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${i($)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${i(f)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${M+O+$+f>=0?"success":"danger"}">
              ${i(M+O+$+f)}
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
      </html>`,this.openHtmlWindow(w,c==="pdf")}}generateAnnualReport(c){if(!this.selectedYear){alert("Please select a year.");return}let a=this.selectedYear.toString(),n=this.stateService.state(),v=n.transactions||[],y=v.filter(t=>t.date.startsWith(a)),d={},l=0,p={},g=0;for(let t of y)t.type==="income"?(d[t.categoryId]=(d[t.categoryId]||0)+t.amount,l+=t.amount):t.type==="expense"&&(p[t.categoryId]=(p[t.categoryId]||0)+t.amount,g+=t.amount);let x={},C={},b={};for(let t of n.banks)x[t.id]=0;for(let t of n.wallets||[])C[t.id]=0;for(let t of n.cards||[])b[t.id]=0;for(let t of v)t.accountType==="bank"&&x[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(x[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(x[t.accountId]-=t.amount)),t.accountType==="wallet"&&C[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(C[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(C[t.accountId]-=t.amount)),t.accountType==="card"&&b[t.accountId]!==void 0&&((t.type==="income"||t.type==="others-in")&&(b[t.accountId]+=t.amount),(t.type==="expense"||t.type==="others-out")&&(b[t.accountId]-=t.amount));let M=0;for(let t of n.banks)M+=x[t.id];let O=0;for(let t of n.wallets||[])O+=C[t.id];let f=0;for(let t of n.cards||[])f+=b[t.id];let $=0,S=(n.fixedDeposits||[]).filter(t=>t.status==="active");for(let t of S)$+=t.amount;let e=Array(12).fill(0),i=Array(12).fill(0);for(let t of y){let o=t.date.split("-");if(o.length>=2){let w=parseInt(o[1],10)-1;w>=0&&w<12&&(t.type==="income"?e[w]+=t.amount:t.type==="expense"&&(i[w]+=t.amount))}}if(c==="csv"){let t=[];t.push(`Annual Summary Report,${a}`),t.push(""),t.push("INCOME ANALYSIS"),t.push("Category,Amount,Percentage");for(let o of Object.keys(d)){let w=l>0?d[o]/l*100:0;t.push(`"${this.getCategoryName(o)}",${d[o].toFixed(2)},${w.toFixed(1)}%`)}t.push(`"TOTAL INCOME",${l.toFixed(2)},100.0%`),t.push(""),t.push("EXPENSES ANALYSIS"),t.push("Category,Amount,Percentage");for(let o of Object.keys(p)){let w=g>0?p[o]/g*100:0;t.push(`"${this.getCategoryName(o)}",${p[o].toFixed(2)},${w.toFixed(1)}%`)}t.push(`"TOTAL EXPENSES",${g.toFixed(2)},100.0%`),t.push(""),t.push(`"NET CASH FLOW",${(l-g).toFixed(2)}`),t.push(""),t.push("CURRENT ASSET BALANCES"),t.push("Banks"),t.push("Account Name,Balance");for(let o of n.banks)t.push(`"${o.name}",${x[o.id].toFixed(2)}`);t.push(`"Total Bank Capital",${M.toFixed(2)}`),t.push(""),t.push("Wallets"),t.push("Account Name,Balance");for(let o of n.wallets||[])t.push(`"${o.name}",${C[o.id].toFixed(2)}`);t.push(`"Total Wallet Capital",${O.toFixed(2)}`),t.push(""),t.push("Credit Cards"),t.push("Account Name,Outstanding");for(let o of n.cards||[])t.push(`"${o.name}",${b[o.id].toFixed(2)}`);t.push(`"Total Credit Card Outstanding",${f.toFixed(2)}`),t.push(""),t.push("Fixed Deposits (Active)"),t.push("Bank,Principal,Maturity Date");for(let o of S)t.push(`"${this.getBankName(o.bankId)}",${o.amount.toFixed(2)},${this.getMaturityDate(o).toISOString().split("T")[0]}`);t.push(`"Total Active FDs",${$.toFixed(2)}`),t.push(""),t.push(`"NET ASSET BALANCE",${(M+O+$+f).toFixed(2)}`),this.downloadFile(t.join(`
`),`Annual_Summary_${a}.csv`,"text/csv;charset=utf-8;")}else{let t=this.stateService.currencySymbol(),o=r=>{let P=r<0,I=Math.abs(r).toFixed(2);return P?`-${t}${I}`:`${t}${I}`},w=Object.keys(d).map(r=>({label:this.getCategoryName(r),value:Number(d[r].toFixed(2)),color:this.getCategoryColor(r)})),s=Object.keys(p).map(r=>({label:this.getCategoryName(r),value:Number(p[r].toFixed(2)),color:this.getCategoryColor(r)})),_=this.getHtmlTemplate(`Annual Summary - ${a}`);_+=`
        <div class="header">
          <h1>Annual Financial Summary</h1>
          <p>For the year of <strong>${a}</strong></p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <h3>Total Income</h3>
            <div class="amount success">${o(l)}</div>
          </div>
          <div class="card">
            <h3>Total Expenses</h3>
            <div class="amount danger">${o(g)}</div>
          </div>
          <div class="card highlight">
            <h3>Net Cash Flow</h3>
            <div class="amount ${l>=g?"success":"danger"}">${o(l-g)}</div>
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
                ${Object.keys(d).map(r=>{let P=l>0?d[r]/l*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(r)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${P}%; background-color: ${this.getCategoryColor(r)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${P.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--success);">${o(d[r])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(d).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No income transactions this year</td></tr>':""}
                <tr class="total-row">
                  <td>Total Income</td>
                  <td class="right">100%</td>
                  <td class="right">${o(l)}</td>
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
                ${Object.keys(p).map(r=>{let P=g>0?p[r]/g*100:0;return`
                    <tr>
                      <td>
                        <div style="font-weight: 600; margin-bottom: 4px;">${this.getCategoryName(r)}</div>
                        <div class="progress-container">
                          <div class="progress-fill" style="width: ${P}%; background-color: ${this.getCategoryColor(r)}"></div>
                        </div>
                      </td>
                      <td class="right" style="vertical-align: middle; color: var(--text-muted); font-size: 0.9rem;">${P.toFixed(1)}%</td>
                      <td class="right" style="vertical-align: middle; font-weight: 600; color: var(--danger);">${o(p[r])}</td>
                    </tr>
                  `}).join("")}
                ${Object.keys(p).length===0?'<tr><td colspan="3" style="color: var(--text-muted); text-align: center; padding: 2rem;">No expense transactions this year</td></tr>':""}
                <tr class="total-row">
                  <td>Total Expenses</td>
                  <td class="right">100%</td>
                  <td class="right">${o(g)}</td>
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
                ${n.banks.map(r=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${r.color||"var(--primary)"};"></span>
                        <span>${r.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${o(x[r.id])}</td>
                  </tr>
                `).join("")}
                ${n.banks.length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No banks added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Bank Capital</td>
                  <td class="right">${o(M)}</td>
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
                ${(n.wallets||[]).map(r=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${r.color||"var(--success)"};"></span>
                        <span>${r.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600;">${o(C[r.id])}</td>
                  </tr>
                `).join("")}
                ${(n.wallets||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No wallets added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Wallet Capital</td>
                  <td class="right">${o(O)}</td>
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
                ${(n.cards||[]).map(r=>`
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="color-dot" style="background-color: ${r.color||"var(--danger)"};"></span>
                        <span>${r.name}</span>
                      </div>
                    </td>
                    <td class="right" style="font-weight: 600; color: ${b[r.id]<0?"var(--danger)":"var(--text)"};">
                      ${o(b[r.id])}
                    </td>
                  </tr>
                `).join("")}
                ${(n.cards||[]).length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No credit cards added</td></tr>':""}
                <tr class="asset-total-row">
                  <td>Total Outstanding</td>
                  <td class="right" style="color: ${f<0?"var(--danger)":"var(--text)"};">${o(f)}</td>
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
                ${(n.fixedDeposits||[]).filter(r=>r.status==="active").map(r=>`
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${this.getBankName(r.bankId)}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">Matures: ${this.getMaturityDate(r).toISOString().split("T")[0]} (${r.percentage}%)</div>
                    </td>
                    <td class="right" style="font-weight: 600; vertical-align: middle;">${o(r.amount)}</td>
                  </tr>
                `).join("")}
                ${(n.fixedDeposits||[]).filter(r=>r.status==="active").length===0?'<tr><td colspan="2" style="color: var(--text-muted); text-align: center;">No active fixed deposits</td></tr>':""}
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
            <strong>${o(M+O)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Fixed Assets (Fixed Deposits)</span>
            <strong>+ ${o($)}</strong>
          </div>
          <div class="summary-line">
            <span>Total Credit Card Liabilities</span>
            <strong style="color: var(--danger);">${o(f)}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Net Asset Balance</span>
            <span class="${M+O+$+f>=0?"success":"danger"}">
              ${o(M+O+$+f)}
            </span>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <script>
          Chart.defaults.color = '#94a3b8';
          Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
          Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

          const incomeData = ${JSON.stringify(w)};
          const expenseData = ${JSON.stringify(s)};
          const monthlyIncome = ${JSON.stringify(e)};
          const monthlyExpense = ${JSON.stringify(i)};

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
      </html>`,this.openHtmlWindow(_,c==="pdf")}}openHtmlWindow(c,a){let n=window.open("","_blank");n?(n.document.write(c),n.document.close(),a&&(n.focus(),setTimeout(()=>{n.print()},250))):alert("Your browser blocked the popup. Please enable popups to generate reports.")}downloadFile(c,a,n){let v=new Blob([c],{type:n}),y=URL.createObjectURL(v),d=document.createElement("a");d.href=y,d.download=a,d.click(),URL.revokeObjectURL(y)}getHtmlTemplate(c){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c}</title>
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
<body>`}getCategoryName(c){let a=this.stateService.state().categories.find(n=>n.id===c);return a?a.name:"Unknown Category"}getCategoryColor(c){let a=this.stateService.state().categories.find(n=>n.id===c);return a&&a.color||"#3b82f6"}getBankName(c){let a=this.stateService.state().banks.find(n=>n.id===c);return a?a.name:"Unknown Bank"}getMaturityDate(c){let a=new Date(c.startDate);return a.setMonth(a.getMonth()+c.months),a}static \u0275fac=function(a){return new(a||E)(B(X))};static \u0275cmp=j({type:E,selectors:[["app-report"]],features:[R([L])],decls:53,vars:6,consts:[[1,"module-container"],[1,"module-header"],[1,"title-area"],[1,"page-title"],[1,"subtitle"],[1,"report-grid"],[1,"report-card","glass-card"],[1,"report-icon"],[1,"report-details"],[1,"report-actions"],[1,"input-group"],["type","month",3,"ngModelChange","ngModel"],[1,"button-group"],[1,"row-group"],["title","Open report in new tab",1,"btn-action",3,"click","disabled"],["title","Download or print as PDF",1,"btn-primary",3,"click","disabled"],["type","number","min","2000","max","2100","step","1",3,"ngModelChange","ngModel"]],template:function(a,n){a&1&&(u(0,"div",0)(1,"header",1)(2,"div",2)(3,"div")(4,"h1",3),h(5,"Reports"),m(),u(6,"p",4),h(7,"Generate detailed financial reports and "),u(8,"span"),h(9,"track your progress"),m()()()()(),u(10,"div",5)(11,"div",6)(12,"div",7),h(13,"\u{1F4CA}"),m(),u(14,"div",8)(15,"h2"),h(16,"Monthly Financial Report"),m(),u(17,"p"),h(18,"A comprehensive report showing income, expenses, and your current asset balances including Banks, Wallets, and Fixed Deposits."),m(),u(19,"div",9)(20,"div",10)(21,"label"),h(22,"Select Month"),m(),u(23,"input",11),D("ngModelChange",function(y){return T(n.selectedMonth,y)||(n.selectedMonth=y),y}),m()(),u(24,"div",12)(25,"div",13)(26,"button",14),N("click",function(){return n.generateReport("view")}),u(27,"span"),h(28,"\u{1F441}\uFE0F"),m(),h(29," View "),m(),u(30,"button",15),N("click",function(){return n.generateReport("pdf")}),h(31," Generate as PDF "),m()()()()()(),u(32,"div",6)(33,"div",7),h(34,"\u{1F4C8}"),m(),u(35,"div",8)(36,"h2"),h(37,"Annual Summary"),m(),u(38,"p"),h(39,"Year-end review of your income and major spending categories for the selected year."),m(),u(40,"div",9)(41,"div",10)(42,"label"),h(43,"Select Year"),m(),u(44,"input",16),D("ngModelChange",function(y){return T(n.selectedYear,y)||(n.selectedYear=y),y}),m()(),u(45,"div",12)(46,"div",13)(47,"button",14),N("click",function(){return n.generateAnnualReport("view")}),u(48,"span"),h(49,"\u{1F441}\uFE0F"),m(),h(50," View "),m(),u(51,"button",15),N("click",function(){return n.generateAnnualReport("pdf")}),h(52," Generate as PDF "),m()()()()()()()()),a&2&&(k(23),A("ngModel",n.selectedMonth),k(3),F("disabled",!n.selectedMonth),k(4),F("disabled",!n.selectedMonth),k(14),A("ngModel",n.selectedYear),k(3),F("disabled",!n.selectedYear),k(4),F("disabled",!n.selectedYear))},dependencies:[W,G,z,J,Y,V,H,U],styles:[".report-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:2rem;margin-top:2rem}.report-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:2rem;transition:transform .3s ease,box-shadow .3s ease;position:relative;overflow:hidden}.report-card[_ngcontent-%COMP%]:hover:not(.placeholder){transform:translateY(-5px);box-shadow:0 15px 30px -10px #0000004d;border-color:#4facfe66}.report-card.placeholder[_ngcontent-%COMP%]{opacity:.6}.report-card.placeholder[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{filter:grayscale(1)}.report-card[_ngcontent-%COMP%]   .report-icon[_ngcontent-%COMP%]{font-size:3rem;margin-bottom:1.5rem;background:#ffffff0d;width:70px;height:70px;display:flex;align-items:center;justify-content:center;border-radius:16px;border:1px solid rgba(255,255,255,.1)}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0 0 .5rem;font-size:1.3rem;color:#fff}.report-card[_ngcontent-%COMP%]   .report-details[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#94a3b8;font-size:.95rem;line-height:1.6;margin:0 0 2rem;flex:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1.5rem;background:#0003;padding:1.5rem;border-radius:12px;border:1px solid rgba(255,255,255,.05)}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:.85rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%], .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]{padding:.75rem 1rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:#ffffff0d;color:#fff;font-family:inherit;font-size:1rem;transition:all .2s;width:100%;box-sizing:border-box}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]:focus, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]:focus{outline:none;border-color:#4facfe;background:#ffffff1a}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button{filter:invert(1);opacity:.5;cursor:pointer}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=month][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-calendar-picker-indicator:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button:hover, .report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button:hover{opacity:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .row-group[_ngcontent-%COMP%]{display:flex;gap:.75rem;width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{flex:1;padding:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:.95rem;font-weight:500;font-family:inherit;border-radius:8px;cursor:pointer;transition:all .2s ease;white-space:nowrap}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:1.1rem;line-height:1}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .full-width[_ngcontent-%COMP%]{width:100%}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%]{background:linear-gradient(135deg,#4facfe,#00f2fe);border:none;color:#0f172a;font-weight:600}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-primary[_ngcontent-%COMP%]:hover{filter:brightness(1.1);box-shadow:0 4px 12px #4facfe4d}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-action[_ngcontent-%COMP%]{background:#ffffff0d;border:1px solid rgba(255,255,255,.1);color:#f8fafc}.report-card[_ngcontent-%COMP%]   .report-actions[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   .btn-action[_ngcontent-%COMP%]:hover{background:#ffffff1f;border-color:#fff3}"]})};export{q as ReportComponent};
