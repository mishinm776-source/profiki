import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, Bell, Building2, CheckCircle2, ChevronDown, CircleHelp,
  ClipboardList, Gauge, LayoutDashboard, LogOut, Menu, Plus, Search,
  Settings, Wrench, X, AlertTriangle, Clock3, Package, Filter
} from "lucide-react";
import "./style.css";

const initialEquipment = [
  { id: 1, name: "Компрессор К-120", code: "EQ-001", type: "Компрессор", location: "Цех №1", status: "Работает", date: "24.10.2026" },
  { id: 2, name: "Насос Н-45", code: "EQ-002", type: "Насос", location: "Цех №2", status: "На обслуживании", date: "20.10.2026" },
  { id: 3, name: "Станок ЧПУ-08", code: "EQ-003", type: "Станок", location: "Цех №1", status: "Работает", date: "18.10.2026" },
  { id: 4, name: "Вентиляция В-12", code: "EQ-004", type: "Вентиляция", location: "Склад", status: "Неисправно", date: "16.10.2026" },
  { id: 5, name: "Генератор G-7", code: "EQ-005", type: "Генератор", location: "Энергоузел", status: "Работает", date: "12.10.2026" }
];
const initialRequests = [
  { id: 1042, equipment: "Насос Н-45", type: "Ремонт", priority: "Высокий", status: "В работе", date: "28.10.2026", description: "Повышенная вибрация при работе" },
  { id: 1041, equipment: "Вентиляция В-12", type: "Диагностика", priority: "Критический", status: "Новая", date: "28.10.2026", description: "Оборудование не запускается" },
  { id: 1040, equipment: "Компрессор К-120", type: "ТО", priority: "Средний", status: "Новая", date: "27.10.2026", description: "Плановое техническое обслуживание" },
  { id: 1039, equipment: "Станок ЧПУ-08", type: "Ремонт", priority: "Низкий", status: "Завершена", date: "26.10.2026", description: "Замена расходного элемента" }
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все статусы");
  const [priorityFilter, setPriorityFilter] = useState("Все приоритеты");
  const [modal, setModal] = useState("");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const filteredEquipment = useMemo(() => equipment.filter(item =>
    (item.name + item.code + item.location).toLowerCase().includes(query.toLowerCase()) &&
    (statusFilter === "Все статусы" || item.status === statusFilter)
  ), [equipment, query, statusFilter]);

  const filteredRequests = useMemo(() => requests.filter(item =>
    (item.equipment + item.description + String(item.id)).toLowerCase().includes(query.toLowerCase()) &&
    (statusFilter === "Все статусы" || item.status === statusFilter) &&
    (priorityFilter === "Все приоритеты" || item.priority === priorityFilter)
  ), [requests, query, statusFilter, priorityFilter]);

  const runAction = (action) => {
    setLoading(true);
    // В учебном демо данные хранятся в состоянии React. Здесь можно подключить REST API.
    Promise.resolve().then(() => {
      action();
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      notify("Ошибка соединения. Проверьте доступность сервера.");
    });
  };

  const saveEquipment = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    runAction(() => {
      if (editing) {
        setEquipment(old => old.map(item => item.id === editing.id ? { ...item, ...data } : item));
        notify("Оборудование обновлено");
      } else {
        setEquipment(old => [{ id: Date.now(), code: `EQ-${String(old.length + 1).padStart(3, "0")}`, ...data }, ...old]);
        notify("Оборудование добавлено");
      }
      setModal("");
      setEditing(null);
    });
  };

  const saveRequest = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    runAction(() => {
      setRequests(old => [{ id: Math.max(0, ...old.map(r => r.id)) + 1, date: new Date().toLocaleDateString("ru-RU"), status: "Новая", ...data }, ...old]);
      setModal("");
      notify("Заявка создана");
    });
  };

  const nav = [
    { id: "dashboard", label: "Главная", icon: LayoutDashboard },
    { id: "equipment", label: "Оборудование", icon: Package },
    { id: "requests", label: "Заявки", icon: ClipboardList }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Wrench size={22}/></div><div><b>ТОиР-Проф</b><small>Управление обслуживанием</small></div><button className="mobile-close" onClick={() => setMobileMenu(false)}><X size={18}/></button></div>
      <div className="side-label">МЕНЮ</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => {setPage(item.id); setQuery(""); setStatusFilter("Все статусы"); setMobileMenu(false);}}><item.icon size={19}/><span>{item.label}</span>{item.id === "requests" && <em>{requests.filter(r => r.status === "Новая").length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Нужна помощь?</b><p>Откройте руководство пользователя или обратитесь к администратору.</p><button onClick={() => notify("Демо-версия: руководство пока не подключено")}>Центр помощи <span>↗</span></button></div><div className="profile"><div className="avatar">АМ</div><div className="profile-info"><b>Алексей Морозов</b><small>Руководитель ТОиР</small></div><button title="Выход" onClick={() => notify("Выход доступен после подключения авторизации")}><LogOut size={17}/></button></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={() => setMobileMenu(true)}><Menu/></button><div className="crumb">Предприятие <span>/</span> <b>{nav.find(n => n.id === page)?.label}</b></div><div className="top-actions"><span className="online"><i/> Демо-режим</span><button className="icon-button notification" onClick={() => {setPage("requests"); notify("Показаны текущие заявки");}}><Bell size={19}/><i/></button><div className="top-user"><div className="avatar">АМ</div><ChevronDown size={15}/></div></div></header>
      <div className="content">
        {page === "dashboard" && <Dashboard equipment={equipment} requests={requests} setPage={setPage} />}
        {page === "equipment" && <section>
          <div className="page-heading"><div><div className="eyebrow">УЧЁТ АКТИВОВ</div><h1>Оборудование</h1><p>Контроль состояния и технического обслуживания оборудования.</p></div><button className="primary" onClick={() => {setEditing(null); setModal("equipment");}}><Plus size={18}/> Добавить оборудование</button></div>
          <div className="toolbar"><div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по названию, коду или цеху..."/></div><div className="filter-box"><Filter size={16}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>Все статусы</option><option>Работает</option><option>На обслуживании</option><option>Неисправно</option></select></div></div>
          <div className="table-card"><div className="table-head"><div><h3>Список оборудования</h3><p>Всего записей: {filteredEquipment.length}</p></div><span className="table-tag">Обновлено сейчас</span></div><div className="table-wrap"><table><thead><tr><th>ОБОРУДОВАНИЕ</th><th>КОД</th><th>РАСПОЛОЖЕНИЕ</th><th>ПОСЛЕДНЕЕ ТО</th><th>СТАТУС</th><th></th></tr></thead><tbody>{filteredEquipment.map(item => <tr key={item.id}><td><div className="item-title"><span className="equipment-icon"><Wrench size={17}/></span><div><b>{item.name}</b><small>{item.type}</small></div></div></td><td className="muted">{item.code}</td><td>{item.location}</td><td>{item.date}</td><td><Status value={item.status}/></td><td><button className="row-action" onClick={() => {setEditing(item);setModal("equipment");}}>Изменить</button></td></tr>)}</tbody></table>{filteredEquipment.length === 0 && <div className="empty">Ничего не найдено</div>}</div></div>
        </section>}
        {page === "requests" && <section>
          <div className="page-heading"><div><div className="eyebrow">УПРАВЛЕНИЕ РАБОТАМИ</div><h1>Заявки</h1><p>Создавайте заявки и контролируйте ход выполнения работ.</p></div><button className="primary" onClick={() => setModal("request")}><Plus size={18}/> Новая заявка</button></div>
          <div className="toolbar"><div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по заявкам..."/></div><div className="filter-box"><Filter size={16}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>Все статусы</option><option>Новая</option><option>В работе</option><option>Завершена</option></select></div><div className="filter-box"><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option>Все приоритеты</option><option>Критический</option><option>Высокий</option><option>Средний</option><option>Низкий</option></select></div></div>
          <div className="request-list">{filteredRequests.map(r => <article className="request-card" key={r.id}><div className={`request-symbol ${r.priority === "Критический" ? "red" : r.priority === "Высокий" ? "orange" : ""}`}><ClipboardList size={20}/></div><div className="request-main"><div className="request-title"><b>Заявка #{r.id}</b><span className={`priority priority-${r.priority}`}>{r.priority}</span></div><h3>{r.equipment}</h3><p>{r.description}</p><div className="request-meta"><span><Clock3 size={14}/> {r.date}</span><span>{r.type}</span></div></div><div className="request-side"><Status value={r.status}/><select aria-label="Изменить статус заявки" value={r.status} onChange={e => {setRequests(old => old.map(x => x.id === r.id ? {...x, status: e.target.value} : x)); notify("Статус заявки обновлён");}}><option>Новая</option><option>В работе</option><option>Завершена</option></select></div></article>)}{filteredRequests.length === 0 && <div className="empty">Заявок по заданным параметрам нет</div>}</div>
        </section>}
        <footer className="footer"><span>© 2026 ТОиР-Проф</span><span>Система управления техническим обслуживанием</span><span className="footer-status"><i/> Все системы работают</span></footer>
      </div>
    </main>

    {loading && <div className="loading"><span className="spinner"/> Выполнение операции...</div>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={() => setToast("")}><X size={16}/></button></div>}
    {modal && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget){setModal("");setEditing(null);}}}><div className="modal"><div className="modal-heading"><div><h2>{modal === "equipment" ? (editing ? "Редактировать оборудование" : "Новое оборудование") : "Создать заявку"}</h2><p>Заполните поля ниже</p></div><button className="icon-button" onClick={() => {setModal("");setEditing(null);}}><X/></button></div>
      {modal === "equipment" ? <form onSubmit={saveEquipment} className="form-grid"><label className="full">Название оборудования<input name="name" required defaultValue={editing?.name || ""} placeholder="Например, Насос Н-50"/></label><label>Тип оборудования<input name="type" required defaultValue={editing?.type || ""} placeholder="Насос"/></label><label>Расположение<input name="location" required defaultValue={editing?.location || ""} placeholder="Цех №1"/></label><label className="full">Статус<select name="status" defaultValue={editing?.status || "Работает"}><option>Работает</option><option>На обслуживании</option><option>Неисправно</option></select></label><div className="modal-actions full"><button type="button" className="secondary" onClick={() => {setModal("");setEditing(null);}}>Отмена</button><button className="primary" type="submit"><CheckCircle2 size={17}/> Сохранить</button></div></form> :
      <form onSubmit={saveRequest} className="form-grid"><label className="full">Оборудование<select name="equipment" required>{equipment.map(e => <option key={e.id}>{e.name}</option>)}</select></label><label>Тип заявки<select name="type"><option>Ремонт</option><option>ТО</option><option>Диагностика</option></select></label><label>Приоритет<select name="priority"><option>Средний</option><option>Низкий</option><option>Высокий</option><option>Критический</option></select></label><label className="full">Описание<textarea name="description" required rows="3" placeholder="Опишите неисправность или работы..."/></label><div className="modal-actions full"><button type="button" className="secondary" onClick={() => setModal("")}>Отмена</button><button className="primary" type="submit"><Plus size={17}/> Создать заявку</button></div></form>}
    </div></div>}
  </div>;
}

function Status({value}) {
  const cls = value === "Работает" || value === "Завершена" ? "green" : value === "Неисправно" ? "red" : value === "В работе" || value === "На обслуживании" ? "blue" : "amber";
  return <span className={`status ${cls}`}><i/>{value}</span>;
}

function Dashboard({equipment, requests, setPage}) {
  const working = equipment.filter(e => e.status === "Работает").length;
  const active = requests.filter(r => r.status !== "Завершена").length;
  const downtime = 18;
  const counts = [
    {label:"Всего оборудования",value:equipment.length,sub:"Единиц на учёте",icon:Package,color:"blue",trend:"+2 за месяц"},
    {label:"Активные заявки",value:active,sub:"Требуют внимания",icon:ClipboardList,color:"purple",trend:`${requests.filter(r=>r.status==="Новая").length} новых`},
    {label:"Простой за месяц",value:`${downtime} ч`,sub:"Суммарное время простоя",icon:Activity,color:"orange",trend:"−12% к прошлому месяцу"}
  ];
  const statusData = [
    {label:"Работает",count:equipment.filter(e=>e.status==="Работает").length,color:"#22a06b"},
    {label:"На обслуживании",count:equipment.filter(e=>e.status==="На обслуживании").length,color:"#5486e8"},
    {label:"Неисправно",count:equipment.filter(e=>e.status==="Неисправно").length,color:"#e45c5c"}
  ];
  return <section>
    <div className="welcome"><div><div className="eyebrow">СРЕДА, 28 ОКТЯБРЯ 2026</div><h1>Добрый день, Алексей <span>👋</span></h1><p>Вот сводка по техническому обслуживанию на сегодня.</p></div><div className="welcome-icon"><Gauge size={32}/></div></div>
    <div className="page-heading compact"><div><h2>Обзор показателей</h2><p>Ключевые метрики предприятия</p></div><button className="text-button" onClick={() => setPage("equipment")}>Все оборудование <span>→</span></button></div>
    <div className="kpi-grid">{counts.map(c=><div className="kpi-card" key={c.label}><div className="kpi-top"><span>{c.label}</span><span className={`kpi-icon ${c.color}`}><c.icon size={20}/></span></div><div className="kpi-value">{c.value}</div><div className="kpi-bottom"><span>{c.sub}</span><em>{c.trend}</em></div></div>)}</div>
    <div className="dashboard-grid"><div className="panel status-panel"><div className="panel-heading"><div><h3>Состояние оборудования</h3><p>Распределение по статусам</p></div><span className="panel-icon"><Activity size={18}/></span></div><div className="chart-area"><div className="donut" style={{background:`conic-gradient(${statusData.map((d,i)=>`${d.color} ${statusData.slice(0,i).reduce((s,x)=>s+x.count,0)/Math.max(equipment.length,1)*100}% ${(statusData.slice(0,i).reduce((s,x)=>s+x.count,0)+d.count)/Math.max(equipment.length,1)*100}%`).join(",")})`}}><div className="donut-inner"><b>{equipment.length}</b><small>единиц</small></div></div><div className="legend">{statusData.map(d=><div className="legend-row" key={d.label}><span><i style={{background:d.color}}/>{d.label}</span><b>{d.count}</b></div>)}</div></div><div className="panel-foot"><span><CheckCircle2 size={16}/> Исправно работает {working} из {equipment.length}</span></div></div>
      <div className="panel recent-panel"><div className="panel-heading"><div><h3>Последние заявки</h3><p>Недавние обращения</p></div><button className="text-button" onClick={() => setPage("requests")}>Все заявки →</button></div><div className="recent-list">{requests.slice(0,4).map(r=><div className="recent-row" key={r.id}><div className={`recent-icon ${r.priority==="Критический"?"red":r.priority==="Высокий"?"orange":""}`}><Wrench size={17}/></div><div className="recent-info"><b>#{r.id} · {r.equipment}</b><small>{r.type} · {r.date}</small></div><Status value={r.status}/></div>)}</div><button className="outline-wide" onClick={() => setPage("requests")}>Открыть список заявок <span>→</span></button></div>
    </div>
    <div className="notice"><div className="notice-icon"><AlertTriangle size={19}/></div><div><b>Требует внимания</b><p>{equipment.filter(e=>e.status==="Неисправно").length} единицы оборудования имеют статус «Неисправно». Проверьте связанные заявки и назначьте ответственных.</p></div><button onClick={() => setPage("equipment")}>Проверить <span>→</span></button></div>
  </section>;
}

createRoot(document.getElementById("root")).render(<App/>);
