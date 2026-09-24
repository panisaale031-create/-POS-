const app = {
  shop: { name: '', address: '', phone: '', tax: '', taxRate: 7, password: '1234' },
  currentUser: null,
  products: [],
  customers: [],
  sales: [],
  users: [],
  cart: [],
  consignmentShops: [],
  consignmentProducts: [],
  consignmentReceived: [],
  consignmentReturned: [],
  currentEditId: null,
  currentFormType: null,
  currentCategory: 'ทั้งหมด',

  init() {
    this.load();
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.showApp();
    }
  },

  login(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!user || !pass) { alert('กรุณากรอกข้อมูลให้ครบ'); return false; }
    if (pass !== this.shop.password) { alert('รหัสผ่านไม่ถูกต้อง'); return false; }
    this.currentUser = { user };
    localStorage.setItem('user', JSON.stringify(this.currentUser));
    this.save();
    this.showApp();
    return false;
  },

  showApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('shop-name-sidebar').textContent = (this.shop.name || 'POS');
    document.getElementById('user-sidebar').textContent = this.currentUser.user;
    this.renderDashboard();
    this.renderProducts();
    this.renderCustomers();
    this.renderUsers();
    const today = new Date();
    document.getElementById('filter-date-from').value = today.toISOString().split('T')[0];
    document.getElementById('filter-date-to').value = today.toISOString().split('T')[0];
  },

  logout() {
    this.currentUser = null;
    this.cart = [];
    localStorage.removeItem('user');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
  },

  switchTab(e, tab) {
    e.preventDefault();
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(t => t.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    if (e.target.classList.contains('sidebar-item')) e.target.classList.add('active');

    if (tab === 'dashboard') this.renderDashboard();
    if (tab === 'products') this.renderProducts();
    if (tab === 'stock') this.renderStock();
    if (tab === 'customers') this.renderCustomers();
    if (tab === 'sales') this.renderProductGrid();
    if (tab === 'bills') this.renderBills();
    if (tab === 'reports') this.renderReports();
    if (tab === 'users') this.renderUsers();
    if (tab === 'settings') this.loadSettings();
    if (tab === 'consignment') this.switchConsignmentTab('shops');
  },

  renderDashboard() {
    const today = new Date().toDateString();
    const todaySales = this.sales.filter(s => new Date(s.date).toDateString() === today);
    const cashSales = todaySales.filter(s => s.method === 'cash').reduce((sum, s) => sum + s.total, 0);
    const transferSales = todaySales.filter(s => s.method === 'transfer').reduce((sum, s) => sum + s.total, 0);
    const creditSales = todaySales.filter(s => s.method === 'credit').reduce((sum, s) => sum + s.total, 0);
    const totalRevenue = this.sales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = this.sales.reduce((sum, s) => sum + s.cost, 0);
    const netProfit = totalRevenue - totalCost;
    const profit = netProfit > 0 ? netProfit : 0;
    const loss = netProfit < 0 ? Math.abs(netProfit) : 0;
    const receivable = this.sales.filter(s => s.status === 'credit').reduce((sum, s) => sum + s.total, 0);

    document.getElementById('stat-total-sales').textContent = this.formatCurrency(totalRevenue);
    document.getElementById('stat-cash-today').textContent = this.formatCurrency(cashSales);
    document.getElementById('stat-transfer-today').textContent = this.formatCurrency(transferSales);
    document.getElementById('stat-credit-today').textContent = this.formatCurrency(creditSales);
    document.getElementById('stat-profit').textContent = this.formatCurrency(profit);
    document.getElementById('stat-loss').textContent = this.formatCurrency(loss);
    document.getElementById('stat-receivable').textContent = this.formatCurrency(receivable);
  },

  renderProducts() {
    const search = (document.getElementById('search-products')?.value || '').toLowerCase();
    const filtered = this.products.filter(p => p.name.toLowerCase().includes(search));
    const rows = filtered.map(p => `
      <tr>
        <td>${p.code || '-'}</td>
        <td>${p.name}</td>
        <td>${this.formatCurrency(p.costPrice)}</td>
        <td>${this.formatCurrency(p.price)}</td>
        <td>${p.stock}</td>
        <td class="act-btns">
          <button class="btn btn-small" onclick="app.openEditProduct(${p.id})">แก้ไข</button>
          <button class="btn btn-small btn-danger" onclick="app.deleteProduct(${p.id})">ลบ</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('products-tbody').innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderStock() {
    const rows = this.products.map(p => `
      <tr>
        <td>${p.code || '-'}</td>
        <td>${p.name}</td>
        <td>${p.stock}</td>
        <td>${this.formatCurrency(p.costPrice)}</td>
        <td class="act-btns">
          <button class="btn btn-small" onclick="app.openAdjustStock(${p.id})">ปรับ</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('stock-tbody').innerHTML = rows || '<tr><td colspan="5" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderCustomers() {
    const search = (document.getElementById('search-cust')?.value || '').toLowerCase();
    const filtered = this.customers.filter(c => c.name.toLowerCase().includes(search));
    const rows = filtered.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.email || '-'}</td>
        <td>${this.formatCurrency(c.totalSpent || 0)}</td>
        <td class="act-btns">
          <button class="btn btn-small" onclick="app.openEditCustomer(${c.id})">แก้ไข</button>
          <button class="btn btn-small btn-danger" onclick="app.deleteCustomer(${c.id})">ลบ</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('customers-tbody').innerHTML = rows || '<tr><td colspan="5" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderBills() {
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const status = document.getElementById('filter-status').value;

    let filtered = this.sales;
    if (dateFrom) filtered = filtered.filter(s => s.date.split('T')[0] >= dateFrom);
    if (dateTo) filtered = filtered.filter(s => s.date.split('T')[0] <= dateTo);
    if (status) filtered = filtered.filter(s => s.status === status);

    const rows = filtered.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.date.split('T')[0]}</td>
        <td>${this.formatCurrency(s.total)}</td>
        <td>${s.method === 'cash' ? '💵 เงินสด' : s.method === 'transfer' ? '🏦 โอน' : '🟡 เครดิต'}</td>
        <td>${s.status === 'paid' ? '🟢 จ่ายแล้ว' : s.status === 'credit' ? '🟡 เครดิต' : '🔴 ยกเลิก'}</td>
        <td class="act-btns">
          <button class="btn btn-small" onclick="app.viewReceipt('${s.id}')">ดู</button>
          <button class="btn btn-small btn-danger" onclick="app.deleteBill('${s.id}')">ลบ</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('bills-tbody').innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderReports() {
    // Sales summary by date
    const salesByDate = {};
    this.sales.forEach(s => {
      const date = s.date.split('T')[0];
      if (!salesByDate[date]) salesByDate[date] = { sales: 0, cash: 0, transfer: 0, credit: 0, receivable: 0 };
      salesByDate[date].sales += s.total;
      if (s.method === 'cash') salesByDate[date].cash += s.total;
      if (s.method === 'transfer') salesByDate[date].transfer += s.total;
      if (s.method === 'credit') salesByDate[date].credit += s.total;
      if (s.status === 'credit') salesByDate[date].receivable += s.total;
    });
    let salesHtml = Object.keys(salesByDate).sort().reverse().map(date => {
      const d = salesByDate[date];
      return `<tr><td>${date}</td><td>${this.formatCurrency(d.sales)}</td><td>${this.formatCurrency(d.cash)}</td><td>${this.formatCurrency(d.transfer)}</td><td>${this.formatCurrency(d.credit)}</td><td>${this.formatCurrency(d.receivable)}</td></tr>`;
    }).join('');
    document.getElementById('sales-summary-tbody').innerHTML = salesHtml || '<tr><td colspan="6" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';

    // Receivables
    const receivable = this.sales.filter(s => s.status === 'credit');
    let receivableHtml = receivable.map(s => `
      <tr>
        <td>${this.customers.find(c => c.id === s.customerId)?.name || 'ไม่ระบุ'}</td>
        <td>${this.formatCurrency(s.total)}</td>
        <td>${s.date.split('T')[0]}</td>
      </tr>
    `).join('');
    document.getElementById('receivable-tbody').innerHTML = receivableHtml || '<tr><td colspan="3" style="text-align:center;color:var(--muted)">ไม่มีลูกหนี้</td></tr>';

    // Customer summary
    const custSummary = {};
    this.sales.forEach(s => {
      const cid = s.customerId || 'noname';
      if (!custSummary[cid]) custSummary[cid] = { spent: 0, count: 0, name: this.customers.find(c => c.id === cid)?.name || 'ไม่ระบุ' };
      custSummary[cid].spent += s.total;
      custSummary[cid].count += 1;
    });
    let custHtml = Object.values(custSummary).map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${this.formatCurrency(c.spent)}</td>
        <td>${c.count}</td>
      </tr>
    `).join('');
    document.getElementById('customer-summary-tbody').innerHTML = custHtml || '<tr><td colspan="3" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';

    // Stock summary
    const stockHtml = this.products.map(p => `
      <tr>
        <td>${p.code || '-'}</td>
        <td>${p.name}</td>
        <td>${p.stock}</td>
        <td>${this.formatCurrency(p.costPrice)}</td>
        <td>${this.formatCurrency(p.stock * p.costPrice)}</td>
      </tr>
    `).join('');
    document.getElementById('stock-summary-tbody').innerHTML = stockHtml || '<tr><td colspan="5" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderUsers() {
    const rows = this.users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.pass}</td>
        <td class="act-btns">
          <button class="btn btn-small" onclick="app.openEditUser(${u.id})">แก้ไข</button>
          <button class="btn btn-small btn-danger" onclick="app.deleteUser(${u.id})">ลบ</button>
        </td>
      </tr>
    `).join('');
    document.getElementById('users-tbody').innerHTML = rows || '<tr><td colspan="3" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>';
  },

  renderProductGrid() {
    const search = (document.getElementById('search-prod')?.value || '').toLowerCase();
    const filtered = this.products.filter(p => p.name.toLowerCase().includes(search));
    const grid = filtered.map(p => `
      <div onclick="app.addToCart(${p.id})" style="background:var(--surface);border-radius:var(--rs);padding:8px;cursor:${p.stock > 0 ? 'pointer' : 'not-allowed'};border:2px solid transparent;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:var(--sh);transition:.15s;text-align:center;${p.stock <= 0 ? 'opacity:.4' : ''}">
        <div style="font-size:32px">${p.icon}</div>
        <div style="font-size:11px;font-weight:700;text-align:center;line-height:1.3;word-break:break-word;flex:1;display:flex;align-items:center;justify-content:center">${p.name}</div>
        <div style="font-size:13px;font-weight:900;color:var(--primary)">฿${p.price}</div>
        <div style="font-size:10px;color:var(--muted)">${p.stock} ชิ้น</div>
      </div>
    `).join('');
    document.getElementById('product-grid').innerHTML = grid || '<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:30px">ไม่มีสินค้า</div>';
  },

  addToCart(id) {
    const prod = this.products.find(p => p.id === id);
    if (!prod || prod.stock <= 0) return;
    const item = this.cart.find(c => c.id === id);
    if (item && item.qty < prod.stock) item.qty++;
    else if (!item) this.cart.push({...prod, qty: 1});
    this.renderCart();
  },

  updateQty(id, qty) {
    const item = this.cart.find(c => c.id === id);
    const prod = this.products.find(p => p.id === id);
    if (qty > 0 && qty <= prod.stock) item.qty = qty;
    this.renderCart();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(c => c.id !== id);
    this.renderCart();
  },

  clearCart() {
    this.cart = [];
    this.renderCart();
  },

  renderCart() {
    const items = this.cart.length === 0 ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:12px">ตะกร้าว่าง</div>' : this.cart.map(item => `
      <div style="display:flex;align-items:center;gap:5px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px">
        <div style="font-size:20px;flex-shrink:0">${item.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
        </div>
        <div style="display:flex;align-items:center;gap:3px">
          <button style="width:18px;height:18px;border-radius:50%;border:1px solid var(--border2);background:var(--bg);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:none;background:none;padding:0;font-family:inherit" onclick="app.updateQty(${item.id}, ${item.qty - 1})">−</button>
          <span style="font-size:11px;font-weight:800;min-width:14px;text-align:center">${item.qty}</span>
          <button style="width:18px;height:18px;border-radius:50%;border:1px solid var(--border2);background:var(--bg);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:none;background:none;padding:0;font-family:inherit" onclick="app.updateQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
        <div style="font-size:11px;font-weight:800;min-width:45px;text-align:right">฿${(item.price * item.qty).toLocaleString('th-TH', {minimumFractionDigits:2})}</div>
        <button style="color:var(--muted);cursor:pointer;font-size:12px;background:none;border:none;padding:2px 3px;flex-shrink:0;font-family:inherit" onclick="app.removeFromCart(${item.id})">×</button>
      </div>
    `).join('');
    document.getElementById('cart-items').innerHTML = items;

    const subtotal = this.cart.reduce((s, item) => s + item.price * item.qty, 0);
    document.getElementById('cart-subtotal').textContent = this.formatCurrency(subtotal);
    document.getElementById('cart-total').textContent = this.formatCurrency(subtotal);
  },

  openCheckout() {
    if (this.cart.length === 0) { alert('ตะกร้าว่าง'); return; }
    document.getElementById('received-amount').value = 0;
    document.getElementById('discount-amount').value = 0;
    const custSelect = document.getElementById('checkout-customer');
    custSelect.innerHTML = '<option value="">ไม่ระบุลูกค้า</option>' + this.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const subtotal = this.cart.reduce((s, item) => s + item.price * item.qty, 0);
    document.getElementById('checkout-subtotal').textContent = this.formatCurrency(subtotal);
    document.getElementById('checkout-modal').classList.add('open');
    this.updatePaymentUI();
  },

  updatePaymentUI() {
    const method = document.getElementById('payment-method').value;
    document.getElementById('received-field').style.display = method === 'cash' ? 'flex' : 'none';
    document.getElementById('discount-field').style.display = 'flex';
  },

  calcTotal() {
    const subtotal = this.cart.reduce((s, item) => s + item.price * item.qty, 0);
    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const total = Math.max(0, subtotal - discount);
    document.getElementById('checkout-subtotal').textContent = this.formatCurrency(total);
    this.calcChange();
  },

  calcChange() {
    const subtotal = this.cart.reduce((s, item) => s + item.price * item.qty, 0);
    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const total = Math.max(0, subtotal - discount);
    const received = parseFloat(document.getElementById('received-amount').value) || 0;
    if (received > 0) {
      const change = received - total;
      document.getElementById('change-amount').textContent = this.formatCurrency(change);
      document.getElementById('change-display').style.display = change >= 0 ? 'block' : 'none';
    }
  },

  completeCheckout() {
    const subtotal = this.cart.reduce((s, item) => s + item.price * item.qty, 0);
    const discount = parseFloat(document.getElementById('discount-amount').value) || 0;
    const finalTotal = Math.max(0, subtotal - discount);
    const cost = this.cart.reduce((s, item) => s + (item.costPrice || 0) * item.qty, 0);
    const method = document.getElementById('payment-method').value;
    const received = parseFloat(document.getElementById('received-amount').value) || finalTotal;
    const customerId = parseInt(document.getElementById('checkout-customer').value) || null;

    if (method === 'cash' && received < finalTotal) { alert('จำนวนเงินไม่พอ'); return; }

    const billId = 'BL' + String(this.sales.length + 1).padStart(5, '0');
    const sale = {
      id: billId,
      date: new Date().toISOString(),
      items: [...this.cart],
      total: finalTotal,
      subtotal: subtotal,
      discount: discount,
      cost: cost,
      method,
      status: method === 'credit' ? 'credit' : 'paid',
      customerId,
      user: this.currentUser.user
    };

    this.cart.forEach(item => {
      const p = this.products.find(x => x.id === item.id);
      if (p) p.stock -= item.qty;
    });

    if (customerId) {
      const cust = this.customers.find(c => c.id === customerId);
      if (cust) cust.totalSpent = (cust.totalSpent || 0) + finalTotal;
    }

    this.sales.push(sale);
    this.save();
    this.cart = [];
    this.renderCart();
    document.getElementById('checkout-modal').classList.remove('open');
    alert('✓ ขายสำเร็จ ' + billId);
    this.renderProductGrid();
    this.renderDashboard();
  },

  viewReceipt(billId) {
    const sale = this.sales.find(s => s.id === billId);
    if (!sale) return;
    const cust = this.customers.find(c => c.id === sale.customerId);
    const itemsHtml = sale.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:right">${item.qty}</td>
        <td style="text-align:right">฿${item.price}</td>
        <td style="text-align:right">฿${(item.qty * item.price).toFixed(2)}</td>
      </tr>
    `).join('');
    document.getElementById('receipt-body').innerHTML = `
      <div style="font-size:12px">
        <div style="padding:10px;border-bottom:1px solid var(--border)">
          <div style="font-weight:800;margin-bottom:4px">${this.shop.name || 'ร้าน'}</div>
          <div style="font-size:10px;color:var(--muted)">${this.shop.address || ''}</div>
          <div style="font-size:10px;color:var(--muted)">เบอร์: ${this.shop.phone || ''}</div>
          <div style="font-size:10px;color:var(--muted)">เลขประจำตัว: ${this.shop.tax || ''}</div>
        </div>
        <div style="padding:10px;border-bottom:1px solid var(--border)">
          <div style="font-weight:800">เลขที่บิล: ${sale.id}</div>
          <div style="font-size:10px">วันที่: ${sale.date.split('T')[0]} ${sale.date.split('T')[1].substring(0, 5)}</div>
          <div style="font-size:10px">พนักงาน: ${sale.user}</div>
          ${cust ? `<div style="font-size:10px">ลูกค้า: ${cust.name}</div>` : ''}
        </div>
        <table style="width:100%;font-size:11px;margin-bottom:10px;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid var(--border)">
              <th style="text-align:left;padding:4px 0">สินค้า</th>
              <th style="text-align:right;padding:4px 0">จำนวน</th>
              <th style="text-align:right;padding:4px 0">ราคา</th>
              <th style="text-align:right;padding:4px 0">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="border-top:1px solid var(--border);padding:10px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>ยอดรวม:</span><span style="font-weight:700">฿${sale.subtotal.toFixed(2)}</span></div>
          ${sale.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>ส่วนลด:</span><span style="color:var(--danger)">-฿${sale.discount.toFixed(2)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;font-weight:900;font-size:14px;border-top:1px solid var(--border);padding-top:6px"><span>ยอดสุทธิ:</span><span>฿${sale.total.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;color:var(--muted)"><span>วิธีชำระ:</span><span>${sale.method === 'cash' ? '💵 เงินสด' : sale.method === 'transfer' ? '🏦 โอน' : '🟡 เครดิต'}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted)"><span>สถานะ:</span><span>${sale.status === 'paid' ? '🟢 จ่ายแล้ว' : '🟡 เครดิต'}</span></div>
        </div>
      </div>
    `;
    document.getElementById('receipt-modal').classList.add('open');
    document.getElementById('receipt-print-btn').onclick = () => this.printReceipt(billId);
    document.getElementById('receipt-delete-btn').onclick = () => this.deleteBill(billId);
  },

  printReceipt(billId) {
    const sale = this.sales.find(s => s.id === billId);
    if (!sale) return;
    const cust = this.customers.find(c => c.id === sale.customerId);
    const itemsHtml = sale.items.map(item => `
      <tr>
        <td style="text-align:left">${item.name}</td>
        <td style="text-align:right;padding:0 4px">${item.qty}</td>
        <td style="text-align:right;padding:0 4px">฿${item.price}</td>
        <td style="text-align:right;padding:0 4px">฿${(item.qty * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>บิล #${sale.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Sarabun', Arial, sans-serif;
      line-height: 1.2;
      width: 80mm;
      margin: 0 auto;
      padding: 8px;
      background: white;
      color: #000;
    }
    .receipt-header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .shop-name {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .shop-info {
      font-size: 10px;
      margin: 1px 0;
    }
    .bill-info {
      font-size: 11px;
      border-bottom: 1px dashed #000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
      font-size: 11px;
    }
    thead tr {
      border-bottom: 1px solid #000;
    }
    th {
      text-align: left;
      padding: 2px 0;
      font-weight: bold;
      font-size: 10px;
    }
    td {
      padding: 2px 0;
    }
    .total-section {
      border-top: 1px solid #000;
      border-bottom: 1px dashed #000;
      padding: 4px 0;
      margin: 4px 0;
      font-size: 11px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }
    .grand-total {
      font-weight: bold;
      font-size: 13px;
      margin: 3px 0;
    }
    .payment-status {
      font-size: 10px;
      margin: 2px 0;
      display: flex;
      justify-content: space-between;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 8px;
      border-top: 1px dashed #000;
      padding-top: 4px;
    }
    @media print {
      body { width: 80mm; margin: 0; padding: 4px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="shop-name">${this.shop.name || 'ร้าน'}</div>
    <div class="shop-info">${this.shop.address || ''}</div>
    <div class="shop-info">เบอร์: ${this.shop.phone || ''}</div>
    <div class="shop-info">เลขประจำตัว: ${this.shop.tax || ''}</div>
  </div>

  <div class="bill-info">
    <div><strong>เลขที่บิล:</strong> ${sale.id}</div>
    <div><strong>วันที่:</strong> ${sale.date.split('T')[0]} ${sale.date.split('T')[1].substring(0, 5)}</div>
    <div><strong>พนักงาน:</strong> ${sale.user}</div>
    ${cust ? `<div><strong>ลูกค้า:</strong> ${cust.name}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>สินค้า</th>
        <th style="text-align:right;width:15%">จำนวน</th>
        <th style="text-align:right;width:15%">ราคา</th>
        <th style="text-align:right;width:18%">รวม</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-line">
      <span>ยอดรวม:</span>
      <span style="font-weight:bold">฿${sale.subtotal.toFixed(2)}</span>
    </div>
    ${sale.discount > 0 ? `<div class="total-line"><span>ส่วนลด:</span><span style="color:red">-฿${sale.discount.toFixed(2)}</span></div>` : ''}
    <div class="total-line grand-total">
      <span>ยอดสุทธิ:</span>
      <span>฿${sale.total.toFixed(2)}</span>
    </div>
  </div>

  <div class="payment-status">
    <span><strong>วิธีชำระ:</strong> ${sale.method === 'cash' ? '💵 เงินสด' : sale.method === 'transfer' ? '🏦 โอน' : '🟡 เครดิต'}</span>
  </div>
  <div class="payment-status">
    <span><strong>สถานะ:</strong> ${sale.status === 'paid' ? '🟢 จ่ายแล้ว' : '🟡 เครดิต'}</span>
  </div>

  <div class="footer">
    <div>ขอบคุณที่ใช้บริการ</div>
    <div style="margin-top:4px;font-size:9px">${new Date().toLocaleString('th-TH')}</div>
  </div>

  <div class="no-print" style="text-align:center;margin-top:10px">
    <button onclick="window.print()" style="padding:8px 16px;margin:4px;cursor:pointer;font-size:14px">🖨️ พิมพ์</button>
    <button onclick="window.close()" style="padding:8px 16px;margin:4px;cursor:pointer;font-size:14px">✕ ปิด</button>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  },

  deleteBill(billId) {
    if (!confirm('ต้องการลบบิลนี้ใช่ไหม? (ไม่สามารถกู้คืนได้)')) return;
    this.sales = this.sales.filter(s => s.id !== billId);
    this.save();
    this.renderBills();
    this.renderDashboard();
    document.getElementById('receipt-modal').classList.remove('open');
  },

  openAddProduct() {
    this.currentEditId = null;
    this.currentFormType = 'product';
    document.getElementById('form-title').textContent = 'เพิ่มสินค้า';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>รหัส</label><input id="form-code" type="text"></div>
      <div class="form-field"><label>ไอคอน</label><input id="form-icon" type="text" value="📦" maxlength="2"></div>
      <div class="form-field"><label>ชื่อสินค้า</label><input id="form-name" type="text"></div>
      <div class="form-field"><label>ราคาทุน</label><input id="form-cost-price" type="number" placeholder="0"></div>
      <div class="form-field"><label>ราคาขาย</label><input id="form-price" type="number" placeholder="0"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openEditProduct(id) {
    const prod = this.products.find(p => p.id === id);
    this.currentEditId = id;
    this.currentFormType = 'product';
    document.getElementById('form-title').textContent = 'แก้ไขสินค้า';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>รหัส</label><input id="form-code" type="text" value="${prod.code || ''}"></div>
      <div class="form-field"><label>ไอคอน</label><input id="form-icon" type="text" value="${prod.icon}"></div>
      <div class="form-field"><label>ชื่อสินค้า</label><input id="form-name" type="text" value="${prod.name}"></div>
      <div class="form-field"><label>ราคาทุน</label><input id="form-cost-price" type="number" value="${prod.costPrice}"></div>
      <div class="form-field"><label>ราคาขาย</label><input id="form-price" type="number" value="${prod.price}"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  deleteProduct(id) {
    if (confirm('ลบสินค้านี้?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.save();
      this.renderProducts();
    }
  },

  openAddStock() {
    this.currentEditId = null;
    this.currentFormType = 'stock';
    document.getElementById('form-title').textContent = 'เพิ่มสต็อก';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>เลือกสินค้า</label>
        <select id="form-product-id" onchange="app.updateStockForm()">${this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="form-field"><label>สต็อกปัจจุบัน</label><input id="form-current-stock" type="number" disabled></div>
      <div class="form-field"><label>สต็อกใหม่</label><input id="form-new-stock" type="number" placeholder="0" min="0"></div>
    `;
    if (this.products.length > 0) {
      setTimeout(() => app.updateStockForm(), 0);
    }
    document.getElementById('form-modal').classList.add('open');
  },

  updateStockForm() {
    const prodId = parseInt(document.getElementById('form-product-id').value);
    const prod = this.products.find(p => p.id === prodId);
    if (prod) {
      document.getElementById('form-current-stock').value = prod.stock;
      document.getElementById('form-new-stock').value = '';
    }
  },

  openAdjustStock(id) {
    const prod = this.products.find(p => p.id === id);
    this.currentEditId = id;
    this.currentFormType = 'adjust-stock';
    document.getElementById('form-title').textContent = 'ปรับสต็อก: ' + prod.name;
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>สต็อกปัจจุบัน</label><input type="text" value="${prod.stock}" disabled></div>
      <div class="form-field"><label>จำนวนสต็อกใหม่</label><input id="form-stock" type="number" value="${prod.stock}" min="0"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openAddCustomer() {
    this.currentEditId = null;
    this.currentFormType = 'customer';
    document.getElementById('form-title').textContent = 'เพิ่มลูกค้า';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>ชื่อ</label><input id="form-name" type="text"></div>
      <div class="form-field"><label>โทร</label><input id="form-phone" type="tel"></div>
      <div class="form-field"><label>อีเมล</label><input id="form-email" type="email"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openEditCustomer(id) {
    const cust = this.customers.find(c => c.id === id);
    this.currentEditId = id;
    this.currentFormType = 'customer';
    document.getElementById('form-title').textContent = 'แก้ไขลูกค้า';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>ชื่อ</label><input id="form-name" type="text" value="${cust.name}"></div>
      <div class="form-field"><label>โทร</label><input id="form-phone" type="tel" value="${cust.phone || ''}"></div>
      <div class="form-field"><label>อีเมล</label><input id="form-email" type="email" value="${cust.email || ''}"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  deleteCustomer(id) {
    if (confirm('ลบลูกค้านี้?')) {
      this.customers = this.customers.filter(c => c.id !== id);
      this.save();
      this.renderCustomers();
    }
  },

  openAddUser() {
    this.currentEditId = null;
    this.currentFormType = 'user';
    document.getElementById('form-title').textContent = 'เพิ่มผู้ใช้';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>ชื่อผู้ใช้</label><input id="form-name" type="text"></div>
      <div class="form-field"><label>รหัสสิทธิ์</label><input id="form-pass" type="password"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openEditUser(id) {
    const user = this.users.find(u => u.id === id);
    this.currentEditId = id;
    this.currentFormType = 'user';
    document.getElementById('form-title').textContent = 'แก้ไขผู้ใช้';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>ชื่อผู้ใช้</label><input id="form-name" type="text" value="${user.name}"></div>
      <div class="form-field"><label>รหัสสิทธิ์</label><input id="form-pass" type="password" value="${user.pass}"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  deleteUser(id) {
    if (confirm('ลบผู้ใช้นี้?')) {
      this.users = this.users.filter(u => u.id !== id);
      this.save();
      this.renderUsers();
    }
  },

  saveForm() {
    if (this.currentFormType === 'product') {
      const code = document.getElementById('form-code').value.trim();
      const icon = document.getElementById('form-icon').value.trim();
      const name = document.getElementById('form-name').value.trim();
      const costPrice = parseFloat(document.getElementById('form-cost-price').value) || 0;
      const price = parseFloat(document.getElementById('form-price').value) || 0;
      if (!name) { alert('กรุณากรอกชื่อสินค้า'); return; }
      if (this.currentEditId) {
        const p = this.products.find(x => x.id === this.currentEditId);
        p.code = code;
        p.icon = icon;
        p.name = name;
        p.costPrice = costPrice;
        p.price = price;
      } else {
        this.products.push({
          id: Date.now(),
          code,
          icon,
          name,
          costPrice,
          price,
          stock: 0
        });
      }
      this.save();
      this.renderProducts();
    } else if (this.currentFormType === 'customer') {
      const name = document.getElementById('form-name').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const email = document.getElementById('form-email').value.trim();
      if (!name) { alert('กรุณากรอกชื่อลูกค้า'); return; }
      if (this.currentEditId) {
        const c = this.customers.find(x => x.id === this.currentEditId);
        c.name = name;
        c.phone = phone;
        c.email = email;
      } else {
        this.customers.push({
          id: Date.now(),
          name,
          phone,
          email,
          totalSpent: 0
        });
      }
      this.save();
      this.renderCustomers();
    } else if (this.currentFormType === 'user') {
      const name = document.getElementById('form-name').value.trim();
      const pass = document.getElementById('form-pass').value.trim();
      if (!name || !pass) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
      if (this.currentEditId) {
        const u = this.users.find(x => x.id === this.currentEditId);
        u.name = name;
        u.pass = pass;
      } else {
        this.users.push({
          id: Date.now(),
          name,
          pass
        });
      }
      this.save();
      this.renderUsers();
    } else if (this.currentFormType === 'stock') {
      const prodId = parseInt(document.getElementById('form-product-id').value);
      const newStock = parseInt(document.getElementById('form-new-stock').value);
      if (isNaN(newStock) || newStock < 0) { alert('กรุณากรอกจำนวนที่ถูกต้อง'); return; }
      const prod = this.products.find(p => p.id === prodId);
      if (prod) {
        const oldStock = prod.stock;
        prod.stock = newStock;
        this.save();
        this.renderStock();
        alert('✓ ปรับสต็อก ' + prod.name + ' จาก ' + oldStock + ' ชิ้น เป็น ' + newStock + ' ชิ้น สำเร็จ');
      }
    } else if (this.currentFormType === 'adjust-stock') {
      const newStock = parseInt(document.getElementById('form-stock').value) || 0;
      const prod = this.products.find(p => p.id === this.currentEditId);
      if (prod) {
        prod.stock = newStock;
        this.save();
        this.renderStock();
        alert('✓ ปรับสต็อกสำเร็จ');
      }
    } else if (this.currentFormType === 'cons-shop') {
      const name = document.getElementById('form-shop-name').value.trim();
      const contact = document.getElementById('form-contact').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const commission = parseFloat(document.getElementById('form-commission').value) || 0;
      if (!name) { alert('กรุณากรอกชื่อร้าน'); return; }
      this.consignmentShops.push({
        id: Date.now(),
        name,
        contact,
        phone,
        commission
      });
      this.save();
      alert('✓ เพิ่มร้านฝากขายสำเร็จ');
    } else if (this.currentFormType === 'cons-product') {
      const prodId = parseInt(document.getElementById('form-product-id').value);
      const qty = parseInt(document.getElementById('form-qty').value) || 0;
      const price = parseFloat(document.getElementById('form-price').value) || 0;
      const shopId = parseInt(document.getElementById('form-shop-id').value);
      if (qty <= 0 || price <= 0) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
      const prod = this.products.find(p => p.id === prodId);
      if (prod) {
        this.consignmentProducts.push({
          id: Date.now(),
          productId: prodId,
          name: prod.name,
          qty,
          price,
          shopId,
          date: new Date().toISOString()
        });
        this.save();
        alert('✓ เพิ่มสินค้าฝากสำเร็จ');
      }
    } else if (this.currentFormType === 'cons-received') {
      const shopId = parseInt(document.getElementById('form-shop-id').value);
      const date = document.getElementById('form-date').value;
      const sales = parseFloat(document.getElementById('form-sales').value) || 0;
      const commission = parseFloat(document.getElementById('form-commission').value) || 0;
      const status = document.getElementById('form-status').value;
      if (sales <= 0) { alert('กรุณากรอกยอดขาย'); return; }
      this.consignmentReceived.push({
        id: Date.now(),
        shopId,
        date,
        sales,
        commission,
        net: sales - commission,
        status
      });
      this.save();
      alert('✓ บันทึกรับเงินสำเร็จ');
    } else if (this.currentFormType === 'cons-returned') {
      const prodId = parseInt(document.getElementById('form-product-id').value);
      const qty = parseInt(document.getElementById('form-qty').value) || 0;
      const shopId = parseInt(document.getElementById('form-shop-id').value);
      const date = document.getElementById('form-date').value;
      const condition = document.getElementById('form-condition').value;
      const status = document.getElementById('form-status').value;
      if (qty <= 0) { alert('กรุณากรอกจำนวน'); return; }
      const prod = this.products.find(p => p.id === prodId);
      if (prod) {
        this.consignmentReturned.push({
          id: Date.now(),
          productId: prodId,
          name: prod.name,
          qty,
          shopId,
          date,
          condition,
          status
        });
        this.save();
        alert('✓ บันทึกรับสินค้าคืนสำเร็จ');
      }
    }
    this.closeModal();
  },

  closeModal() {
    document.getElementById('form-modal').classList.remove('open');
    document.getElementById('checkout-modal').classList.remove('open');
    document.getElementById('receipt-modal').classList.remove('open');
    this.currentEditId = null;
    this.currentFormType = null;
  },

  loadSettings() {
    document.getElementById('setting-shop-name').value = this.shop.name || '';
    document.getElementById('setting-shop-phone').value = this.shop.phone || '';
    document.getElementById('setting-shop-tax').value = this.shop.tax || '';
    document.getElementById('setting-shop-address').value = this.shop.address || '';
    document.getElementById('setting-shop-taxrate').value = this.shop.taxRate || 7;
  },

  saveSettings() {
    this.shop.name = document.getElementById('setting-shop-name').value.trim();
    this.shop.phone = document.getElementById('setting-shop-phone').value.trim();
    this.shop.tax = document.getElementById('setting-shop-tax').value.trim();
    this.shop.address = document.getElementById('setting-shop-address').value.trim();
    this.shop.taxRate = parseFloat(document.getElementById('setting-shop-taxrate').value) || 7;
    const newPass = document.getElementById('setting-new-pass').value.trim();
    const confirmPass = document.getElementById('setting-confirm-pass').value.trim();
    if (newPass && newPass !== confirmPass) { alert('รหัสยืนยันไม่ตรงกัน'); return; }
    if (newPass) this.shop.password = newPass;
    this.save();
    document.getElementById('shop-name-sidebar').textContent = this.shop.name || 'POS';
    alert('✓ บันทึกการตั้งค่าสำเร็จ');
  },

  filterProducts() {
    this.renderProductGrid();
  },

  switchConsignmentTab(tab) {
    document.querySelectorAll('#consignment .section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('[id^="cons-tab-"]').forEach(t => t.classList.remove('btn-primary'));
    document.getElementById('cons-' + tab).classList.add('active');
    document.getElementById('cons-tab-' + tab).classList.add('btn-primary');
  },

  openAddConsignmentShop() {
    this.currentEditId = null;
    this.currentFormType = 'cons-shop';
    document.getElementById('form-title').textContent = 'เพิ่มร้านฝากขาย';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>ชื่อร้าน</label><input id="form-shop-name" type="text"></div>
      <div class="form-field"><label>ผู้ติดต่อ</label><input id="form-contact" type="text"></div>
      <div class="form-field"><label>เบอร์โทร</label><input id="form-phone" type="tel"></div>
      <div class="form-field"><label>ค่าคอม (%)</label><input id="form-commission" type="number" placeholder="0" min="0" max="100"></div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openAddConsignmentProduct() {
    this.currentEditId = null;
    this.currentFormType = 'cons-product';
    document.getElementById('form-title').textContent = 'เพิ่มสินค้าฝาก';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>เลือกสินค้า</label>
        <select id="form-product-id">${this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="form-field"><label>จำนวน</label><input id="form-qty" type="number" placeholder="0" min="1"></div>
      <div class="form-field"><label>ราคา</label><input id="form-price" type="number" placeholder="0" min="0"></div>
      <div class="form-field"><label>เลือกร้าน</label>
        <select id="form-shop-id">${this.consignmentShops.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
      </div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openAddConsignmentReceived() {
    this.currentEditId = null;
    this.currentFormType = 'cons-received';
    document.getElementById('form-title').textContent = 'บันทึกรับเงินจากร้าน';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>เลือกร้าน</label>
        <select id="form-shop-id">${this.consignmentShops.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
      </div>
      <div class="form-field"><label>วันที่</label><input id="form-date" type="date"></div>
      <div class="form-field"><label>ยอดขาย</label><input id="form-sales" type="number" placeholder="0" min="0"></div>
      <div class="form-field"><label>ค่าคอม</label><input id="form-commission" type="number" placeholder="0" min="0"></div>
      <div class="form-field"><label>สถานะ</label>
        <select id="form-status"><option value="pending">รอรับ</option><option value="received">รับแล้ว</option></select>
      </div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  openAddConsignmentReturned() {
    this.currentEditId = null;
    this.currentFormType = 'cons-returned';
    document.getElementById('form-title').textContent = 'บันทึกรับสินค้าคืน';
    document.getElementById('form-body').innerHTML = `
      <div class="form-field"><label>เลือกสินค้า</label>
        <select id="form-product-id">${this.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="form-field"><label>จำนวน</label><input id="form-qty" type="number" placeholder="0" min="1"></div>
      <div class="form-field"><label>เลือกร้าน</label>
        <select id="form-shop-id">${this.consignmentShops.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
      </div>
      <div class="form-field"><label>วันที่</label><input id="form-date" type="date"></div>
      <div class="form-field"><label>สภาพ</label>
        <select id="form-condition"><option value="good">ดี</option><option value="damaged">เสียหาย</option></select>
      </div>
      <div class="form-field"><label>สถานะ</label>
        <select id="form-status"><option value="pending">รอรับ</option><option value="received">รับแล้ว</option></select>
      </div>
    `;
    document.getElementById('form-modal').classList.add('open');
  },

  setPeriod(p) {
    const today = new Date();
    let from, to = new Date();
    if (p === 'today') from = new Date();
    else if (p === 'week') from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (p === 'month') from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (p === 'all') from = new Date(1900, 0, 1);
    else return;
    document.getElementById('filter-date-from').value = from.toISOString().split('T')[0];
    document.getElementById('filter-date-to').value = to.toISOString().split('T')[0];
    this.renderBills();
  },

  formatCurrency(val) {
    return '฿' + val.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  },

  save() {
    const data = {
      shop: this.shop,
      products: this.products,
      customers: this.customers,
      sales: this.sales,
      users: this.users,
      consignmentShops: this.consignmentShops,
      consignmentProducts: this.consignmentProducts,
      consignmentReceived: this.consignmentReceived,
      consignmentReturned: this.consignmentReturned
    };
    localStorage.setItem('pos_data', JSON.stringify(data));
  },

  load() {
    const data = JSON.parse(localStorage.getItem('pos_data')) || {};
    this.shop = data.shop || this.shop;
    this.products = data.products || [];
    this.customers = data.customers || [];
    this.sales = data.sales || [];
    this.users = data.users || [];
    this.consignmentShops = data.consignmentShops || [];
    this.consignmentProducts = data.consignmentProducts || [];
    this.consignmentReceived = data.consignmentReceived || [];
    this.consignmentReturned = data.consignmentReturned || [];
  }
};

app.init();
