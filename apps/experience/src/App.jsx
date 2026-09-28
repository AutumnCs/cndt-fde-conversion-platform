import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  ChatCircleText,
  CaretDown,
  ClipboardText,
  FilmReel,
  FunnelSimple,
  GearSix,
  GridFour,
  Megaphone,
  PaperPlaneTilt,
  PlayCircle,
  ShieldCheck,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { confirmLead } from "./lead-workbench.js";

const navItems = [
  { id: "overview", label: "总览", icon: GridFour },
  { id: "matrix", label: "视频传媒矩阵", icon: FilmReel },
  { id: "leads", label: "线索中心", icon: UsersThree },
  { id: "customer", label: "客户详情", icon: ClipboardText },
  { id: "ai", label: "AI与合规", icon: ShieldCheck },
];

const initialLeads = [
  { id: "tg-1001", time: "11:26", name: "Ming.W", initials: "MW", level: "A", risk: "低风险", note: "希望了解合作方式，已提供公司介绍", status: "待确认", assignee: null },
  { id: "tg-1002", time: "10:54", name: "Younger_L", initials: "YL", level: "B", risk: "中风险", note: "对东南亚市场感兴趣，询问内容合作细节", status: "待确认", assignee: null },
  { id: "tg-1003", time: "10:32", name: "Kai.Tan", initials: "KT", level: "A", risk: "低风险", note: "已关注较久，希望尽快对接", status: "待确认", assignee: null },
  { id: "tg-1004", time: "09:48", name: "Sarah.Y", initials: "SY", level: "C", risk: "低风险", note: "暂不考虑，先了解后续内容", status: "待确认", assignee: null },
  { id: "tg-1005", time: "09:21", name: "David.Z", initials: "DZ", level: "B", risk: "中风险", note: "询问服务范围，需要明确资料", status: "待确认", assignee: null },
];

function Brand() {
  return <div className="brand"><Sparkle size={29} weight="fill" /><span>CNDT</span><small>内部运营工作台</small></div>;
}

function Sidebar({ page, onNavigate }) {
  return <aside className="sidebar"><Brand /><nav>{navItems.map(({ id, label, icon: Icon }) => <button className={page === id ? "nav-item active" : "nav-item"} onClick={() => onNavigate(id)} key={id}><Icon size={21} weight={page === id ? "fill" : "regular"} /><span>{label}</span></button>)}</nav><div className="side-note"><span>连接内容、线索与客户</span><strong>合规内容 · 人工把关</strong></div></aside>;
}

function Topbar({ page, onNavigate }) {
  const label = page === "matrix" ? "视频传媒矩阵" : page === "ai" ? "AI 与合规工作台" : "招商经理工作台";
  return <header className="topbar"><div><h1>{label}</h1><p>2026年9月28日 · 用内容连接真实意向</p></div><div className="top-actions"><button className="switcher" onClick={() => onNavigate(page === "matrix" ? "overview" : "matrix")}><FilmReel size={20} /> {page === "matrix" ? "返回经理工作台" : "切换至 视频传媒矩阵"}</button><button className="icon-button" aria-label="通知"><Bell size={21} /></button><img src="/assets/manager-avatar.png" alt="招商主管头像" /><div className="profile"><b>林悦</b><span>招商主管</span></div><CaretDown size={17} /></div></header>;
}

function Metric({ icon: Icon, label, value, tone }) { return <div className="metric"><div className={`metric-icon ${tone}`}><Icon size={26} weight="fill" /></div><span>{label}</span><strong>{value}</strong><em>较昨日 +12%</em></div>; }

function Overview({ leads, onConfirm }) {
  return <main className="page overview"><section className="overview-grid"><div className="panel funnel-panel"><div className="section-title"><span><FunnelSimple size={22} weight="fill" /> 从内容曝光到客户转化</span><button>近7天 <CaretDown size={14} /></button></div><div className="funnel"><Metric icon={PlayCircle} label="内容曝光" value="128,560" tone="purple" /><span className="arrow">›</span><Metric icon={PaperPlaneTilt} label="Telegram进线" value="2,843" tone="blue" /><span className="arrow">›</span><Metric icon={UsersThree} label="高意向待确认" value="420" tone="purple" /><span className="arrow">›</span><Metric icon={ClipboardText} label="已分配跟进" value="318" tone="purple" /></div></div><aside className="panel priorities"><div className="section-title"><span>今日重点</span><button>查看全部</button></div>{["跟进 12 条高意向线索", "完成 8 个客户的初步沟通", "整理本周重点客户清单", "关注 3 条需合规复核的线索"].map((item, index) => <div className="priority" key={item}><b>{index + 1}</b><span>{item}<small>{index === 0 ? "其中 5 条来自东南亚市场" : "在责任边界内推进下一步"}</small></span></div>)}</aside></section><section className="panel lead-panel"><div className="section-title"><span><UsersThree size={22} weight="fill" /> 最新线索队列</span><button>查看全部线索</button></div><p className="section-subtitle">来自 Telegram 的新线索，经理确认后再分配给专员</p><div className="lead-table"><div className="table-head"><span>时间</span><span>用户昵称</span><span>来源</span><span>意向等级</span><span>风险提示</span><span>备注</span><span>操作</span></div>{leads.map((lead) => <div className="lead-row" key={lead.id}><span>{lead.time}</span><span className="lead-name"><i>{lead.initials}</i>{lead.name}</span><span className="source"><PaperPlaneTilt size={16} weight="fill" /> Telegram</span><span><b className={`tag level-${lead.level.toLowerCase()}`}>{lead.level} · {lead.level === "A" ? "高意向" : lead.level === "B" ? "中意向" : "低意向"}</b></span><span><b className={`tag ${lead.risk === "低风险" ? "safe" : "caution"}`}>{lead.risk}</b></span><span className="lead-note">{lead.note}</span><span>{lead.status === "待确认" ? <button className="primary" onClick={() => onConfirm(lead.id)}>确认并分配</button> : <span className="assigned"><CheckCircle size={17} weight="fill" />{lead.assignee}</span>}</span></div>)}</div></section></main>;
}

function Matrix() {
  const items = [["周一", "东南亚市场趋势解读", "已排期"], ["周二", "CNDT 与合作伙伴", "已排期"], ["周三", "客户案例与服务边界", "待合规"], ["周四", "智能化服务方案", "待合规"], ["周五", "活动回顾与客户问答", "草稿"], ["周六", "知识科普", "草稿"]];
  return <main className="page matrix-page"><section className="panel calendar-panel"><div className="section-title"><span>2026年9月 · 本周内容排期</span><div className="tabs"><button className="selected">周视图</button><button>月视图</button></div></div><div className="calendar">{items.map(([day, title, status], index) => <article key={title}><b>{day}</b><small>9月{7 + index}日</small><div className={`content-card ${status}`}><PlayCircle size={20} weight="fill" /><span>{title}<em>{status}</em></span></div></article>)}</div></section><section className="matrix-bottom"><div className="panel pipeline"><div className="section-title"><span>视频制作流水线</span><button>了解流程</button></div>{[["素材库", "上传与管理素材"], ["脚本", "生成与优化多语言版本"], ["合规审核", "人工审核为主"], ["发布包", "生成封面、字幕与文案"]].map(([title, desc], index) => <div className="pipeline-step" key={title}><b>{index + 1}</b><span>{title}<small>{desc}</small></span></div>)}</div><div className="panel performance"><div className="section-title"><span>活动与入口表现</span><button>近30天</button></div><div className="performance-table">{[["东南亚市场趋势解读", "12,480", "86", "12"], ["制造业数字化升级", "9,320", "54", "8"], ["新加坡行业交流会", "15,760", "112", "21"], ["合规出海指南", "8,605", "47", "6"]].map((row) => <div key={row[0]}><span>{row[0]}<small>Telegram 追踪入口</small></span><b>{row[1]}<small>浏览量</small></b><b>{row[2]}<small>进线</small></b><b>{row[3]}<small>确认高意向</small></b></div>)}</div></div><aside className="panel ai-publisher"><div className="section-title"><span><Megaphone size={21} weight="fill" /> AI宣发官</span><b className="version">v1.3</b></div><p>输出选题、脚本和本地化文案建议；所有内容均需人工审核后才可进入发布包。</p><button className="outline">查看提示词版本</button></aside></section></main>;
}

function AiCompliance({ leads, onConfirm }) {
  const selected = leads.find((lead) => lead.status === "待确认") ?? leads[0];
  return <main className="page ai-page"><section className="ai-grid"><div className="agents">{[[Megaphone, "AI 宣发官", "内容策划、文案和受众分析", "v2.3.1"], [ChatCircleText, "AI 客服官", "Telegram 会话摘要与回复建议", "v1.8.0"], [ShieldCheck, "内容合规负责人", "风险识别、审核与知识引用", "v1.5.2"]].map(([Icon, title, desc, version]) => <article className="panel agent-card" key={title}><Icon size={26} weight="fill" /><h3>{title}</h3><p>{desc}</p><span className="running">运行中</span><dl><div><dt>提示词版本</dt><dd>{version}</dd></div><div><dt>触发范围</dt><dd>需人工审批</dd></div></dl><button className="outline">编辑草案</button></article>)}</div><section className="panel review"><div className="section-title"><span>线索意图审核</span><b>3 / 12</b></div><div className="conversation"><div className="chat incoming">用户（已匿名）<p>你好，我看了你们的视频，想了解本地化服务与合作方式。</p></div><div className="chat assistant">AI 会话摘要<p>用户有明确了解意向，问题集中在服务范围、案例和交付节奏。</p></div><div className="chat incoming">用户（已匿名）<p>能否先安排一次线上沟通？</p></div></div><div className="review-result"><div><span>推荐线索等级</span><b className={`big-level level-${selected.level.toLowerCase()}`}>{selected.level}</b><p>高意向 · 等待经理确认</p></div><div><span>风险提示</span><p><CheckCircle size={17} weight="fill" /> 未发现敏感或违规内容</p><p><CheckCircle size={17} weight="fill" /> 建议仅提供经审核资料</p></div></div><div className="knowledge"><b>知识库引用（3）</b><span>《海外市场内容传播策略》· 章节 3.3</span><span>《客户常见问题与回复建议》· 章节 5.4</span></div><button className="primary review-button" onClick={() => onConfirm(selected.id)}>{selected.status === "待确认" ? "确认线索等级并提交" : "已分配给 " + selected.assignee}</button></section><aside className="approval"><section className="panel"><div className="section-title"><span>待审批队列（5）</span><button>查看全部</button></div>{["#TG-2024-1187", "#TG-2024-1186", "#IG-2024-0942", "#YT-2024-0721"].map((item) => <div className="queue" key={item}><PaperPlaneTilt size={19} weight="fill" /><span>{item}<small>等待人工确认</small></span></div>)}</section><section className="panel audit"><div className="section-title"><span>版本变更记录</span><button>查看全部</button></div>{["v2.3.1 优化受众内容标签", "v2.3.0 优化海外市场问答", "v2.2.0 新增多语言回复模板"].map((item) => <p key={item}>{item}<small>2026-09-28</small></p>)}</section></aside></section></main>;
}

export function App() {
  const [page, setPage] = useState("overview");
  const [leads, setLeads] = useState(initialLeads);
  const confirmedCount = useMemo(() => leads.filter((lead) => lead.status !== "待确认").length, [leads]);
  const handleConfirm = (id) => setLeads((current) => confirmLead(current, id, "王专员"));
  return <div className="app-shell"><Sidebar page={page} onNavigate={setPage} /><div className="workspace"><Topbar page={page} onNavigate={setPage} />{page === "matrix" ? <Matrix /> : page === "ai" ? <AiCompliance leads={leads} onConfirm={handleConfirm} /> : <Overview leads={leads} onConfirm={handleConfirm} />}<footer><span>CNDT Internal · 模拟数据 · {confirmedCount} 条已演示分配</span><span>内容先合规，线索再转化</span></footer></div></div>;
}
