import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  CheckSquare,
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  Send,
  X,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  ExternalLink,
  Search,
  Sparkles,
  UserCheck,
  Shield,
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Video,
  Settings,
  Database,
  Play,
  Download,
  Award,
  AlertCircle,
  LogOut,
  Check
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE (SUBSTITUI PELOS DADOS DO TEU PROJETO FIREBASE)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBx2PAnDqyjdS03DbBmcEOAz_pvFnw3WjU",
  authDomain: "umo-onboarding.firebaseapp.com",
  projectId: "umo-onboarding",
  storageBucket: "umo-onboarding.firebasestorage.app",
  messagingSenderId: "237663837487",
  appId: "1:237663837487:web:b67c06de299877e644d5da",
  measurementId: "G-WT5NGV5PM9"
};

const isFirebaseConfigured =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("COLA_AQUI");

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// ============================================================================
// DADOS INICIAIS PADRÃO (UMO - UNIVERSIDADE MUNDIAL ONLINE)
// ============================================================================
const DEFAULT_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const INITIAL_TASKS = [
  {
    id: "task-1",
    order: 1,
    title: "1. Email de boas-vindas",
    category: "Comunicação Inicial",
    duration: "5 min",
    summary: "Confirmação de receção das credenciais institucionais e acesso à caixa de correio UMO.",
    details:
      "Verifica a tua caixa de correio institucional (@umo.pt). Neste e-mail encontrarás as credenciais temporárias de acesso ao Portal Académico, ao ambiente virtual de aprendizagem (LMS) e o contacto direto do teu mentor docente (Teacher Buddy)."
  },
  {
    id: "task-2",
    order: 2,
    title: "2. Plataforma digital de acolhimento",
    category: "Exploração Digital",
    duration: "15 min",
    summary: "Navegação pelos módulos principais do portal de integração da UMO.",
    details:
      "Explora os separadores desta plataforma: acompanha o teu progresso em 'O Meu Percurso', consulta os horários das sessões síncronas na 'Agenda', conhece a equipa em 'Comunidade' e descarrega os modelos oficiais nos 'Recursos'."
  },
  {
    id: "task-3",
    order: 3,
    title: "3. Manual de acolhimento",
    category: "Documentação Institucional",
    duration: "20 min",
    summary: "Leitura do guia completo sobre a cultura, missão e modelo pedagógico online da UMO.",
    details:
      "O Manual de Acolhimento sintetiza o modelo pedagógico 100% online da Universidade Mundial Online, os direitos e deveres do corpo docente, as boas práticas de comunicação assíncrona e os padrões de acompanhamento tutorial aos estudantes."
  },
  {
    id: "task-4",
    order: 4,
    title: "4. Vídeo institucional",
    category: "Cultura UMO",
    duration: "10 min",
    summary: "Mensagem da Reitoria e apresentação da visão estratégica da Universidade Mundial Online.",
    details:
      "Assiste ao vídeo de boas-vindas disponível no ecrã inicial deste portal para ficares a conhecer a história da UMO, a estrutura das faculdades digitais e o impacto internacional da nossa comunidade académica."
  },
  {
    id: "task-5",
    order: 5,
    title: "5. Checklist de pré-entrada",
    category: "Preparação Técnica",
    duration: "15 min",
    summary: "Validação de equipamento, câmara, microfone, assinatura digital e perfil docente.",
    details:
      "Garante que tens: (1) ligação à internet estável; (2) câmara HD e microfone testados; (3) fotografia profissional carregada no perfil do LMS; (4) assinatura de e-mail institucional configurada; (5) acesso validado ao Microsoft Teams."
  },
  {
    id: "task-6",
    order: 6,
    title: "6. Guia de contactos e comunicação",
    category: "Rede de Apoio",
    duration: "10 min",
    summary: "Identificação dos canais oficiais e interlocutores para questões pedagógicas, técnicas e administrativas.",
    details:
      "Consulta o diretório na secção 'Comunidade'. Para questões curriculares contacta a Coordenação de Curso; para dúvidas operacionais do dia a dia fala com o teu Mentor; para suporte técnico imediato aciona o Apoio Tecnológico."
  },
  {
    id: "task-7",
    order: 7,
    title: "7. Guia de plataformas digitais",
    category: "Sistemas Académicos",
    duration: "25 min",
    summary: "Manual prático do LMS, Portal Académico, ferramentas de videoconferência e sala-modelo.",
    details:
      "Aprende a configurar a tua unidade curricular na sala-modelo do LMS, a publicar recursos semanais, a abrir fóruns de discussão, a registar sumários eletrónicos e a lançar classificações no Portal Académico."
  },
  {
    id: "task-8",
    order: 8,
    title: "8. Perguntas frequentes (FAQ)",
    category: "Autonomia",
    duration: "10 min",
    summary: "Respostas rápidas às dúvidas mais comuns nas primeiras semanas de docência.",
    details:
      "Revê as questões frequentes sobre prazos de lançamento de notas, regras de assiduidade em sessões síncronas, pedidos de alteração de horário e apoio a estudantes com necessidades específicas. Podes também perguntar diretamente ao Teacher Buddy!"
  }
];

const INITIAL_AGENDA = [
  {
    id: "ag-1",
    order: 1,
    hora: "09:30",
    duracao: "30 min",
    acao: "Receção virtual e verificação técnica (áudio, vídeo, acessos ao LMS e e-mail)",
    tipo: "Técnico"
  },
  {
    id: "ag-2",
    order: 2,
    hora: "10:00",
    duracao: "45 min",
    acao: "Boas-vindas institucionais: missão, valores e modelo pedagógico online",
    tipo: "Institucional"
  },
  {
    id: "ag-3",
    order: 3,
    hora: "10:45",
    duracao: "15 min",
    acao: "Pausa",
    tipo: "Intervalo"
  },
  {
    id: "ag-4",
    order: 4,
    hora: "11:00",
    duracao: "45 min",
    acao: "Apresentação da equipa/pares e do coordenador de curso, com dinâmica quebra-gelo (“cartão de visita”)",
    tipo: "Networking"
  },
  {
    id: "ag-5",
    order: 5,
    hora: "11:45",
    duracao: "60 min",
    acao: "Tour pelas plataformas: LMS, e-mail, calendário, videoconferência e sala-modelo",
    tipo: "Formação"
  },
  {
    id: "ag-6",
    order: 6,
    hora: "12:45",
    duracao: "75 min",
    acao: "Pausa de almoço, com “café virtual” opcional com o buddy",
    tipo: "Intervalo"
  },
  {
    id: "ag-7",
    order: 7,
    hora: "14:00",
    duracao: "60 min",
    acao: "Processos essenciais: calendário académico, sumários, avaliação, regulamentos, apoio ao estudante",
    tipo: "Formação"
  },
  {
    id: "ag-8",
    order: 8,
    hora: "15:00",
    duracao: "45 min",
    acao: "Reunião individual com o mentor: expectativas e plano dos primeiros 30 dias",
    tipo: "Mentoria"
  },
  {
    id: "ag-9",
    order: 9,
    hora: "15:45",
    duracao: "45 min",
    acao: "Tempo autónomo: explorar a sala-modelo e completar o perfil",
    tipo: "Autónomo"
  },
  {
    id: "ag-10",
    order: 10,
    hora: "16:30",
    duracao: "30 min",
    acao: "Balanço do dia, mini-inquérito de 3 perguntas e preview do dia 2",
    tipo: "Encerramento"
  }
];

const INITIAL_CONTACTS = [
  {
    id: "ct-1",
    nome: "Ana Ferreira",
    cargo: "Coordenação de Curso",
    email: "ana.ferreira@umo.pt",
    area: "Planeamento curricular, unidades curriculares e equipa docente"
  },
  {
    id: "ct-2",
    nome: "Rui Martins",
    cargo: "Mentor Docente (Teacher Buddy)",
    email: "rui.martins@umo.pt",
    area: "Acompanhamento personalizado nos primeiros 30 dias e boas práticas"
  },
  {
    id: "ct-3",
    nome: "Carla Sousa",
    cargo: "Serviços Académicos",
    email: "carla.sousa@umo.pt",
    area: "Pautas, lançamento de classificações, horários e calendário letivo"
  },
  {
    id: "ct-4",
    nome: "João Lopes",
    cargo: "Apoio Tecnológico",
    email: "joao.lopes@umo.pt",
    area: "Credenciais, LMS, salas de videoconferência e suporte técnico"
  },
  {
    id: "ct-5",
    nome: "Marta Reis",
    cargo: "Biblioteca Digital",
    email: "marta.reis@umo.pt",
    area: "Bases de dados científicas, bibliografia e repositórios digitais"
  },
  {
    id: "ct-6",
    nome: "Tiago Silva",
    cargo: "Qualidade Académica",
    email: "tiago.silva@umo.pt",
    area: "Avaliação pedagógica, inquéritos e melhoria contínua"
  }
];

const INITIAL_RESOURCES = [
  {
    id: "res-1",
    titulo: "Guia rápido do docente",
    categoria: "Onboarding",
    descricao: "Resumo prático com os passos essenciais da primeira semana na UMO.",
    link: "https://umo.pt/recursos/guia-rapido-docente"
  },
  {
    id: "res-2",
    titulo: "Ferramentas de ensino digital",
    categoria: "Tecnologia",
    descricao: "Catálogo de ferramentas interativas, quadros colaborativos e gravação de aulas.",
    link: "https://umo.pt/recursos/ferramentas-ensino-digital"
  },
  {
    id: "res-3",
    titulo: "Biblioteca e bases de dados",
    categoria: "Investigação",
    descricao: "Acesso remoto a revistas científicas, e-books e normas de citação.",
    link: "https://umo.pt/recursos/biblioteca-digital"
  },
  {
    id: "res-4",
    titulo: "Modelo de unidade curricular",
    categoria: "Pedagogia",
    descricao: "Template estruturado para organizar conteúdos, atividades e avaliação no LMS.",
    link: "https://umo.pt/recursos/modelo-uc"
  },
  {
    id: "res-5",
    titulo: "Regulamento académico",
    categoria: "Normativos",
    descricao: "Regras oficiais de avaliação, assiduidade, épocas de exame e ética académica.",
    link: "https://umo.pt/recursos/regulamento-academico"
  },
  {
    id: "res-6",
    titulo: "Manual do Portal Académico",
    categoria: "Sistemas",
    descricao: "Instruções passo a passo para sumários, horários e lançamento de notas.",
    link: "https://umo.pt/recursos/manual-portal-academico"
  }
];

// ============================================================================
// LEITOR DE VÍDEO INTELIGENTE (YOUTUBE, VIMEO, GOOGLE DRIVE E MP4 DIRETO)
// ============================================================================
function SmartVideoPlayer({ url, title = "Vídeo de Boas-Vindas UMO" }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const parsed = useMemo(() => {
    const cleanUrl = (url || "").trim();
    if (!cleanUrl) return { type: "empty" };

    // YouTube (watch, youtu.be, embed, shorts)
    const ytMatch = cleanUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: "iframe",
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
      };
    }

    // Vimeo
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: "iframe",
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // Google Drive
    const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return {
        type: "iframe",
        embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
      };
    }

    // Vídeo direto (.mp4, .webm, .ogg ou outro stream direto)
    return {
      type: "video",
      src: cleanUrl
    };
  }, [url]);

  if (parsed.type === "empty") {
    return (
      <div className="aspect-video w-full rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <Video className="w-10 h-10 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">Nenhum vídeo configurado</p>
        <p className="text-xs text-slate-400 mt-1">
          O administrador pode adicionar o link do vídeo no Backoffice.
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="aspect-video w-full rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-teal-400 mb-3" />
        <p className="font-semibold text-base">Não foi possível incorporar este vídeo diretamente</p>
        <p className="text-xs text-slate-300 max-w-md mt-1 mb-4">
          O servidor onde o vídeo está alojado pode bloquear a reprodução incorporada ou exigir autenticação.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition"
        >
          Abrir Vídeo numa Nova Janela <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200 relative">
      {parsed.type === "iframe" ? (
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      ) : (
        <video
          key={parsed.src}
          src={parsed.src}
          controls
          playsInline
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        >
          O teu navegador não suporta a reprodução de vídeo HTML5.
        </video>
      )}
    </div>
  );
}

// ============================================================================
// ASSISTENTE VIRTUAL: TEACHER BUDDY
// ============================================================================
function getTeacherBuddyReply(question) {
  const q = question.toLowerCase();

  if (q.includes("plataforma") || q.includes("acesso") || q.includes("login") || q.includes("lms") || q.includes("portal")) {
    return "O acesso ao LMS e ao Portal Académico é feito com o teu e-mail institucional (@umo.pt) e a palavra-passe enviada no e-mail de boas-vindas. Se precisares de repor credenciais, contacta o João Lopes (joao.lopes@umo.pt).";
  }
  if (q.includes("assiduidade") || q.includes("sumário") || q.includes("sumario") || q.includes("presença")) {
    return "Os sumários e o registo de assiduidade das sessões síncronas devem ser submetidos no Portal Académico até 48 horas após cada aula, selecionando a unidade curricular e a turma respetiva.";
  }
  if (q.includes("horário") || q.includes("horario") || q.includes("aula")) {
    return "Podes consultar os teus horários letivos no separador 'Agenda' do Portal Académico. Qualquer pedido de ajuste deve ser articulado previamente com a Coordenação de Curso (Ana Ferreira).";
  }
  if (q.includes("nota") || q.includes("classifica") || q.includes("avalia") || q.includes("pauta")) {
    return "O lançamento de classificações realiza-se no Portal Académico na área 'Pautas e Avaliações'. Os prazos oficiais constam no Calendário Académico disponível nos Recursos.";
  }
  if (q.includes("calendário") || q.includes("calendario") || q.includes("feriado") || q.includes("semestre")) {
    return "O Calendário Académico da UMO está disponível na biblioteca de 'Recursos' e detalha o início e fim de semestres, períodos de avaliação e pausas letivas.";
  }
  if (q.includes("técnico") || q.includes("tecnico") || q.includes("erro") || q.includes("câmara") || q.includes("microfone") || q.includes("teams")) {
    return "Para suporte técnico imediato (LMS, Microsoft Teams, áudio ou vídeo), contacta o João Lopes do Apoio Tecnológico através do e-mail joao.lopes@umo.pt.";
  }
  if (q.includes("regulamento") || q.includes("norma") || q.includes("regra")) {
    return "O Regulamento Académico da UMO encontra-se na secção 'Recursos' desta plataforma, onde podes pesquisar diretamente por palavra-chave.";
  }
  if (q.includes("contacto") || q.includes("mentor") || q.includes("coordenador") || q.includes("rui") || q.includes("ana")) {
    return "Todos os contactos principais estão na secção 'Comunidade': Ana Ferreira (Coordenação), Rui Martins (Teu Mentor), Carla Sousa (Serviços Académicos), João Lopes (TI), Marta Reis (Biblioteca) e Tiago Silva (Qualidade).";
  }
  if (q.includes("início") || q.includes("inicio") || q.includes("começar") || q.includes("primeiro")) {
    return "Para iniciares a tua atividade docente: 1) Valida o acesso ao e-mail e LMS; 2) Completa os 8 passos em 'O Meu Percurso'; 3) Participa na sessão de acolhimento da 'Agenda'; 4) Reúne com o teu mentor Rui Martins.";
  }

  return "Ainda não tenho uma resposta automática detalhada para essa questão específica, mas o teu pedido pode ser encaminhado diretamente para a equipa de apoio ao docente ou para o teu mentor Rui Martins (rui.martins@umo.pt) para acompanhamento personalizado.";
}

// ============================================================================
// APLICAÇÃO PRINCIPAL
// ============================================================================
export default function App() {
  // Perfil ativo: 'select' | 'docente' | 'backoffice'
  const [role, setRole] = useState("select");
  const [userId, setUserId] = useState("local-user");

  // Estados dinâmicos da plataforma
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [agenda, setAgenda] = useState(INITIAL_AGENDA);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);

  // Progresso individual do docente
  const [completedTaskIds, setCompletedTaskIds] = useState([]);

  // Navegação do Docente
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [resourceSearch, setResourceSearch] = useState("");

  // Mini-inquérito da Agenda
  const [surveyAnswers, setSurveyAnswers] = useState({ q1: 0, q2: 0, q3: 0 });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Teacher Buddy Chat
  const [buddyOpen, setBuddyOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "buddy",
      text: "Olá! Sou o Teacher Buddy da UMO. Estou disponível 24/7 para ajudar-te com acessos, sumários, avaliações, horários ou contactos. Em que posso ajudar?"
    }
  ]);

  // Navegação e formulários do Backoffice
  const [adminTab, setAdminTab] = useState("config");
  const [videoInput, setVideoInput] = useState(DEFAULT_VIDEO_URL);
  const [adminFeedback, setAdminFeedback] = useState("");

  // Formulários de criação/edição no Backoffice
  const [taskForm, setTaskForm] = useState({ id: null, title: "", category: "", duration: "", summary: "", details: "" });
  const [agendaForm, setAgendaForm] = useState({ id: null, hora: "", duracao: "", acao: "", tipo: "Formação" });
  const [contactForm, setContactForm] = useState({ id: null, nome: "", cargo: "", email: "", area: "" });
  const [resourceForm, setResourceForm] = useState({ id: null, titulo: "", categoria: "", descricao: "", link: "" });

  // ==========================================================================
  // SINCRONIZAÇÃO COM FIRESTORE (SE CONFIGURADO)
  // ==========================================================================
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) return;

    signInAnonymously(auth).catch((err) => console.error("Erro auth anónima:", err));

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    // Configurações (Vídeo)
    const unsubConfig = onSnapshot(doc(db, "umo_settings", "general"), (snap) => {
      if (snap.exists() && snap.data().welcomeVideoUrl !== undefined) {
        const url = snap.data().welcomeVideoUrl;
        setWelcomeVideoUrl(url);
        setVideoInput(url);
      }
    });

    // Tarefas (O Meu Percurso)
    const unsubTasks = onSnapshot(collection(db, "umo_tasks"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 99) - (b.order || 99));
        setTasks(list);
      }
    });

    // Agenda
    const unsubAgenda = onSnapshot(collection(db, "umo_agenda"), (snap) => {
      if (!snap.empty) {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));
        setAgenda(list);
      }
    });

    // Contactos
    const unsubContacts = onSnapshot(collection(db, "umo_contacts"), (snap) => {
      if (!snap.empty) {
        setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    // Recursos
    const unsubResources = onSnapshot(collection(db, "umo_resources"), (snap) => {
      if (!snap.empty) {
        setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    return () => {
      unsubAuth();
      unsubConfig();
      unsubTasks();
      unsubAgenda();
      unsubContacts();
      unsubResources();
    };
  }, []);

  // Carregar progresso do docente
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !userId) return;
    const unsubProgress = onSnapshot(doc(db, "umo_progress", userId), (snap) => {
      if (snap.exists() && Array.isArray(snap.data().completedTaskIds)) {
        setCompletedTaskIds(snap.data().completedTaskIds);
      }
    });
    return () => unsubProgress();
  }, [userId]);

  // ==========================================================================
  // FUNÇÕES DE INTERAÇÃO DO DOCENTE
  // ==========================================================================
  const toggleTaskCompletionAndReturn = async (taskId) => {
    const isCompleted = completedTaskIds.includes(taskId);
    const updated = isCompleted
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];

    setCompletedTaskIds(updated);
    setSelectedTaskId(null); // Volta imediatamente à lista de tarefas

    if (isFirebaseConfigured && db && userId) {
      try {
        await setDoc(doc(db, "umo_progress", userId), { completedTaskIds: updated }, { merge: true });
      } catch (err) {
        console.error("Erro ao guardar progresso:", err);
      }
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput.trim() };
    const botReply = { sender: "buddy", text: getTeacherBuddyReply(chatInput) };
    setChatMessages((prev) => [...prev, userMsg, botReply]);
    setChatInput("");
  };

  const handleExportOutlookICS = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UMO Universidade Mundial Online//Onboarding Docente//PT"
    ];

    agenda.forEach((item, idx) => {
      const cleanHour = item.hora.replace(":", "") + "00";
      icsLines.push(
        "BEGIN:VEVENT",
        `UID:umo-onboarding-${idx}-${today}@umo.pt`,
        `DTSTAMP:${today}T090000Z`,
        `DTSTART:${today}T${cleanHour}`,
        `SUMMARY:UMO Onboarding - ${item.acao}`,
        `DESCRIPTION:Duração: ${item.duracao} | Tipo: ${item.tipo || "Integração"}`,
        "END:VEVENT"
      );
    });

    icsLines.push("END:VCALENDAR");
    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Agenda_Onboarding_UMO.ics";
    link.click();
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    if (!surveyAnswers.q1 || !surveyAnswers.q2 || !surveyAnswers.q3) return;
    setSurveySubmitted(true);
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "umo_surveys"), {
          ...surveyAnswers,
          userId,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Erro ao guardar inquérito:", err);
      }
    }
  };

  // ==========================================================================
  // FUNÇÕES DE GESTÃO DO BACKOFFICE
  // ==========================================================================
  const showNotify = (msg) => {
    setAdminFeedback(msg);
    setTimeout(() => setAdminFeedback(""), 3500);
  };

  const handleSeedDatabase = async () => {
    if (!isFirebaseConfigured || !db) {
      setWelcomeVideoUrl(DEFAULT_VIDEO_URL);
      setVideoInput(DEFAULT_VIDEO_URL);
      setTasks(INITIAL_TASKS);
      setAgenda(INITIAL_AGENDA);
      setContacts(INITIAL_CONTACTS);
      setResources(INITIAL_RESOURCES);
      showNotify("Dados padrão carregados localmente (configura o Firebase para persistir na nuvem).");
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "umo_settings", "general"), { welcomeVideoUrl: DEFAULT_VIDEO_URL });

      INITIAL_TASKS.forEach((t) => batch.set(doc(db, "umo_tasks", t.id), t));
      INITIAL_AGENDA.forEach((a) => batch.set(doc(db, "umo_agenda", a.id), a));
      INITIAL_CONTACTS.forEach((c) => batch.set(doc(db, "umo_contacts", c.id), c));
      INITIAL_RESOURCES.forEach((r) => batch.set(doc(db, "umo_resources", r.id), r));

      await batch.commit();
      showNotify("Todos os dados iniciais da UMO foram gravados no Firebase com sucesso!");
    } catch (err) {
      console.error(err);
      showNotify("Erro ao gravar dados no Firebase. Verifica as regras do Firestore.");
    }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setWelcomeVideoUrl(videoInput);
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "umo_settings", "general"), { welcomeVideoUrl: videoInput }, { merge: true });
    }
    showNotify("Vídeo de boas-vindas atualizado com sucesso!");
  };

  // CRUD Tarefas
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const payload = {
      title: taskForm.title,
      category: taskForm.category || "Geral",
      duration: taskForm.duration || "15 min",
      summary: taskForm.summary,
      details: taskForm.details,
      order: taskForm.id
        ? tasks.find((t) => t.id === taskForm.id)?.order || tasks.length + 1
        : tasks.length + 1
    };

    if (isFirebaseConfigured && db) {
      if (taskForm.id) {
        await updateDoc(doc(db, "umo_tasks", taskForm.id), payload);
      } else {
        await addDoc(collection(db, "umo_tasks"), payload);
      }
    } else {
      if (taskForm.id) {
        setTasks((prev) => prev.map((t) => (t.id === taskForm.id ? { ...t, ...payload } : t)));
      } else {
        setTasks((prev) => [...prev, { id: `task-${Date.now()}`, ...payload }]);
      }
    }
    setTaskForm({ id: null, title: "", category: "", duration: "", summary: "", details: "" });
    showNotify("Passo do percurso guardado!");
  };

  const handleDeleteTask = async (id) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "umo_tasks", id));
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    showNotify("Passo removido.");
  };

  // CRUD Agenda
  const handleSaveAgenda = async (e) => {
    e.preventDefault();
    if (!agendaForm.hora || !agendaForm.acao) return;
    const payload = {
      hora: agendaForm.hora,
      duracao: agendaForm.duracao || "30 min",
      acao: agendaForm.acao,
      tipo: agendaForm.tipo || "Formação"
    };

    if (isFirebaseConfigured && db) {
      if (agendaForm.id) {
        await updateDoc(doc(db, "umo_agenda", agendaForm.id), payload);
      } else {
        await addDoc(collection(db, "umo_agenda"), payload);
      }
    } else {
      if (agendaForm.id) {
        setAgenda((prev) => prev.map((a) => (a.id === agendaForm.id ? { ...a, ...payload } : a)));
      } else {
        setAgenda((prev) =>
          [...prev, { id: `ag-${Date.now()}`, ...payload }].sort((a, b) => a.hora.localeCompare(b.hora))
        );
      }
    }
    setAgendaForm({ id: null, hora: "", duracao: "", acao: "", tipo: "Formação" });
    showNotify("Evento da agenda guardado!");
  };

  const handleDeleteAgenda = async (id) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "umo_agenda", id));
    } else {
      setAgenda((prev) => prev.filter((a) => a.id !== id));
    }
    showNotify("Evento removido.");
  };

  // CRUD Contactos
  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactForm.nome || !contactForm.email) return;
    const payload = {
      nome: contactForm.nome,
      cargo: contactForm.cargo,
      email: contactForm.email,
      area: contactForm.area
    };

    if (isFirebaseConfigured && db) {
      if (contactForm.id) {
        await updateDoc(doc(db, "umo_contacts", contactForm.id), payload);
      } else {
        await addDoc(collection(db, "umo_contacts"), payload);
      }
    } else {
      if (contactForm.id) {
        setContacts((prev) => prev.map((c) => (c.id === contactForm.id ? { ...c, ...payload } : c)));
      } else {
        setContacts((prev) => [...prev, { id: `ct-${Date.now()}`, ...payload }]);
      }
    }
    setContactForm({ id: null, nome: "", cargo: "", email: "", area: "" });
    showNotify("Contacto guardado!");
  };

  const handleDeleteContact = async (id) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "umo_contacts", id));
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
    showNotify("Contacto removido.");
  };

  // CRUD Recursos
  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.titulo) return;
    const payload = {
      titulo: resourceForm.titulo,
      categoria: resourceForm.categoria || "Geral",
      descricao: resourceForm.descricao,
      link: resourceForm.link || "#"
    };

    if (isFirebaseConfigured && db) {
      if (resourceForm.id) {
        await updateDoc(doc(db, "umo_resources", resourceForm.id), payload);
      } else {
        await addDoc(collection(db, "umo_resources"), payload);
      }
    } else {
      if (resourceForm.id) {
        setResources((prev) => prev.map((r) => (r.id === resourceForm.id ? { ...r, ...payload } : r)));
      } else {
        setResources((prev) => [...prev, { id: `res-${Date.now()}`, ...payload }]);
      }
    }
    setResourceForm({ id: null, titulo: "", categoria: "", descricao: "", link: "" });
    showNotify("Recurso guardado!");
  };

  const handleDeleteResource = async (id) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "umo_resources", id));
    } else {
      setResources((prev) => prev.filter((r) => r.id !== id));
    }
    showNotify("Recurso removido.");
  };

  // Cálculos derivados
  const progressPercent = tasks.length
    ? Math.round((completedTaskIds.filter((id) => tasks.some((t) => t.id === id)).length / tasks.length) * 100)
    : 0;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredResources = resources.filter(
    (r) =>
      r.titulo.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.categoria.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.descricao.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  // ==========================================================================
  // ECRÃ 1: SELEÇÃO DE PERFIL (DOCENTE VS BACKOFFICE)
  // ==========================================================================
  if (role === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-900 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-4">
              Universidade Mundial Online
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              UMO — Portal do Docente
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto">
              Plataforma integrada de acolhimento, acompanhamento pedagógico e suporte ao corpo docente.
            </p>

            {!isFirebaseConfigured && (
              <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs max-w-xl mx-auto">
                <strong>Modo Local Ativo:</strong> Para sincronizar as alterações entre utilizadores na nuvem, insere a tua configuração do Firebase no topo de <code>src/App.jsx</code>.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
              <button
                onClick={() => {
                  setRole("docente");
                  setActiveTab("inicio");
                  setSelectedTaskId(null);
                }}
                className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-teal-500 bg-slate-50/50 hover:bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-700 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Portal do Docente</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Acede ao vídeo de boas-vindas, checklist de integração, agenda do dia, contactos, recursos e ao assistente Teacher Buddy.
                  </p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
                  Entrar como Docente <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => {
                  setRole("backoffice");
                  setAdminTab("config");
                }}
                className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 bg-slate-50/50 hover:bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Acesso Backoffice (Admin)</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Gere o vídeo de boas-vindas, edita os passos do percurso, atualiza horários da agenda, contactos e biblioteca de recursos.
                  </p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:translate-x-1 transition-transform">
                  Gerir Conteúdos <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // ECRÃ 2: BACKOFFICE DE ADMINISTRAÇÃO
  // ==========================================================================
  if (role === "backoffice") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
        {/* Menu Lateral Backoffice */}
        <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-5 shrink-0">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center">
                UMO
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Backoffice UMO</p>
                <p className="text-xs text-slate-400">Gestão de Onboarding</p>
              </div>
            </div>

            <nav className="mt-6 space-y-1.5">
              {[
                { id: "config", label: "Vídeo & Início", icon: Video },
                { id: "percurso", label: "O Meu Percurso", icon: CheckSquare },
                { id: "agenda", label: "Agenda", icon: Calendar },
                { id: "contactos", label: "Contactos", icon: Users },
                { id: "recursos", label: "Recursos", icon: BookOpen }
              ].map((item) => {
                const Icon = item.icon;
                const active = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-teal-500 text-slate-950 font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <button
              onClick={handleSeedDatabase}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition"
            >
              <Database className="w-4 h-4" />
              Inicializar Dados Padrão
            </button>
            <button
              onClick={() => setRole("docente")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <UserCheck className="w-4 h-4" />
              Ver Vista Docente
            </button>
            <button
              onClick={() => setRole("select")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              Trocar Perfil
            </button>
          </div>
        </aside>

        {/* Área Principal Backoffice */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl">
          {adminFeedback && (
            <div className="mb-6 p-4 rounded-xl bg-teal-600 text-white text-sm font-medium flex items-center justify-between shadow-lg">
              <span>{adminFeedback}</span>
              <Check className="w-4 h-4" />
            </div>
          )}

          {/* TAB: VÍDEO & CONFIGURAÇÕES */}
          {adminTab === "config" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vídeo de Boas-Vindas (Dashboard Inicial)</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Cola abaixo o link do vídeo institucional (suporta YouTube, Vimeo, Google Drive ou link direto .mp4).
                </p>
              </div>

              <form onSubmit={handleSaveVideo} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou link .mp4"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition"
                >
                  Guardar Vídeo
                </button>
              </form>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Pré-visualização Atual
                </p>
                <div className="max-w-2xl">
                  <SmartVideoPlayer url={videoInput} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: O MEU PERCURSO */}
          {adminTab === "percurso" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {taskForm.id ? "Editar Passo do Percurso" : "Adicionar Novo Passo ao Percurso"}
                </h2>
                <form onSubmit={handleSaveTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Título (ex: 9. Sessão de Mentoria)"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Categoria"
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Duração (ex: 15 min)"
                      value={taskForm.duration}
                      onChange={(e) => setTaskForm({ ...taskForm, duration: e.target.value })}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Resumo curto"
                    value={taskForm.summary}
                    onChange={(e) => setTaskForm({ ...taskForm, summary: e.target.value })}
                    className="md:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <textarea
                    rows={3}
                    placeholder="Descrição detalhada apresentada quando o docente abre a tarefa..."
                    value={taskForm.details}
                    onChange={(e) => setTaskForm({ ...taskForm, details: e.target.value })}
                    className="md:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
                    >
                      {taskForm.id ? "Atualizar Passo" : "Adicionar Passo"}
                    </button>
                    {taskForm.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setTaskForm({ id: null, title: "", category: "", duration: "", summary: "", details: "" })
                        }
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900">Passos Atuais ({tasks.length})</h3>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setTaskForm(t)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AGENDA */}
          {adminTab === "agenda" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {agendaForm.id ? "Editar Bloco da Agenda" : "Adicionar Bloco à Agenda"}
                </h2>
                <form onSubmit={handleSaveAgenda} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Hora (ex: 09:30)"
                    value={agendaForm.hora}
                    onChange={(e) => setAgendaForm({ ...agendaForm, hora: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Duração (ex: 45 min)"
                    value={agendaForm.duracao}
                    onChange={(e) => setAgendaForm({ ...agendaForm, duracao: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tipo (ex: Formação)"
                    value={agendaForm.tipo}
                    onChange={(e) => setAgendaForm({ ...agendaForm, tipo: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
                  >
                    {agendaForm.id ? "Atualizar" : "Adicionar"}
                  </button>
                  <input
                    type="text"
                    required
                    placeholder="Descrição da ação / sessão..."
                    value={agendaForm.acao}
                    onChange={(e) => setAgendaForm({ ...agendaForm, acao: e.target.value })}
                    className="md:col-span-4 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 mb-3">Horário Programado ({agenda.length})</h3>
                {agenda.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs">
                        {item.hora} ({item.duracao})
                      </span>
                      <span className="text-sm text-slate-800">{item.acao}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setAgendaForm(item)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgenda(item.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTACTOS */}
          {adminTab === "contactos" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {contactForm.id ? "Editar Contacto" : "Adicionar Novo Contacto"}
                </h2>
                <form onSubmit={handleSaveContact} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={contactForm.nome}
                    onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Cargo / Função"
                    value={contactForm.cargo}
                    onChange={(e) => setContactForm({ ...contactForm, cargo: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-mail (@umo.pt)"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Área de apoio"
                    value={contactForm.area}
                    onChange={(e) => setContactForm({ ...contactForm, area: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
                    >
                      {contactForm.id ? "Atualizar Contacto" : "Adicionar Contacto"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{c.nome}</p>
                      <p className="text-xs font-semibold text-teal-700">{c.cargo}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setContactForm(c)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RECURSOS */}
          {adminTab === "recursos" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {resourceForm.id ? "Editar Recurso" : "Adicionar Novo Recurso"}
                </h2>
                <form onSubmit={handleSaveResource} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Título do recurso"
                    value={resourceForm.titulo}
                    onChange={(e) => setResourceForm({ ...resourceForm, titulo: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Categoria (ex: Pedagogia)"
                    value={resourceForm.categoria}
                    onChange={(e) => setResourceForm({ ...resourceForm, categoria: e.target.value })}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Descrição breve"
                    value={resourceForm.descricao}
                    onChange={(e) => setResourceForm({ ...resourceForm, descricao: e.target.value })}
                    className="md:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Link do documento (https://...)"
                    value={resourceForm.link}
                    onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                    className="md:col-span-2 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
                    >
                      {resourceForm.id ? "Atualizar Recurso" : "Adicionar Recurso"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {r.categoria}
                      </span>
                      <p className="font-bold text-slate-900 mt-1">{r.titulo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.descricao}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setResourceForm(r)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(r.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================================================
  // ECRÃ 3: PORTAL DO DOCENTE (DESIGN MODERNO TABLET UMO)
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-gradient-to-r from-teal-600 via-cyan-700 to-blue-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab("inicio");
                setSelectedTaskId(null);
              }}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-extrabold text-sm border border-white/25">
                UMO
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-none">
                  UMO - Portal do Docente
                </span>
                <span className="text-[11px] text-teal-100">Universidade Mundial Online</span>
              </div>
            </button>
          </div>

          {/* Navegação Principal */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-full backdrop-blur-sm">
            {[
              { id: "inicio", label: "Início", icon: Home },
              { id: "percurso", label: "O Meu Percurso", icon: CheckSquare },
              { id: "agenda", label: "Agenda", icon: Calendar },
              { id: "comunidade", label: "Comunidade", icon: Users },
              { id: "recursos", label: "Recursos", icon: BookOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTaskId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-blue-900 shadow-sm font-semibold"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBuddyOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Teacher Buddy
            </button>
            <button
              onClick={() => setRole("select")}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-medium transition"
              title="Mudar de perfil"
            >
              Perfis
            </button>
          </div>
        </div>

        {/* Navegação Mobile */}
        <div className="flex md:hidden overflow-x-auto px-4 pb-2.5 gap-1.5">
          {[
            { id: "inicio", label: "Início" },
            { id: "percurso", label: "O Meu Percurso" },
            { id: "agenda", label: "Agenda" },
            { id: "comunidade", label: "Comunidade" },
            { id: "recursos", label: "Recursos" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedTaskId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-blue-900" : "bg-white/15 text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* ================================================================
            SECÇÃO 1: INÍCIO (HERO TABLET DESIGN + VÍDEO DE BOAS-VINDAS)
           ================================================================ */}
        {activeTab === "inicio" && (
          <div>
            {/* Hero Gradiente inspirado na imagem de referência */}
            <section className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-800 text-white pt-10 pb-24 px-4 sm:px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto text-center relative z-10">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  UMO - Portal do Docente
                </h1>
                <p className="text-teal-50 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
                  Bem-vindo(a) à Universidade Mundial Online. Preparamos um percurso estruturado para apoiar os teus primeiros passos na instituição.
                </p>

                {/* 3 Cartões Principais Sobrepostos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                  <button
                    onClick={() => {
                      setActiveTab("percurso");
                      setSelectedTaskId(null);
                    }}
                    className="bg-white text-slate-800 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <CheckSquare className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">1. Guia de Onboarding</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Checklist interativa de 8 passos essenciais
                    </p>
                  </button>

                  <button
                    onClick={() => setBuddyOpen(true)}
                    className="bg-white text-slate-800 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">2. Teacher Buddy</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Mentoria com Rui Martins e suporte 24/7
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab("agenda")}
                    className="bg-white text-slate-800 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">3. Agenda de Integração</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Cronograma completo e mini-inquérito
                    </p>
                  </button>
                </div>

                {/* Botão Pill Principal */}
                <div className="mt-8">
                  <button
                    onClick={() => {
                      setActiveTab("percurso");
                      setSelectedTaskId(null);
                    }}
                    className="px-8 py-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition"
                  >
                    Iniciar Onboarding
                  </button>
                </div>
              </div>
            </section>

            {/* Área Inferior do Dashboard: Vídeo + Progresso + Próximo Evento */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 pb-12 space-y-6 relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vídeo de Boas-Vindas */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                        Mensagem Institucional
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        Vídeo de Boas-Vindas à UMO
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <Play className="w-3.5 h-3.5 text-teal-600" /> Acolhimento
                    </span>
                  </div>
                  <SmartVideoPlayer url={welcomeVideoUrl} />
                </div>

                {/* Resumo de Progresso e Agenda */}
                <div className="space-y-6">
                  {/* Card Progresso */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">O Teu Progresso</h3>
                      <span className="text-sm font-extrabold text-blue-700">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-700 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      {completedTaskIds.length} de {tasks.length} etapas concluídas.
                    </p>
                    <button
                      onClick={() => setActiveTab("percurso")}
                      className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                    >
                      Continuar Percurso
                    </button>
                  </div>

                  {/* Card Próximo Evento */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Próximo Evento na Agenda
                    </span>
                    {agenda[0] ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                          <Clock className="w-3.5 h-3.5" />
                          {agenda[0].hora} ({agenda[0].duracao})
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{agenda[0].acao}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-2">Sem eventos agendados.</p>
                    )}
                    <button
                      onClick={() => setActiveTab("agenda")}
                      className="mt-4 w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs transition"
                    >
                      Ver Agenda Completa
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================
            SECÇÃO 2: O MEU PERCURSO (CHECKLIST CLICÁVEL + VISTA DE DETALHE)
           ================================================================ */}
        {activeTab === "percurso" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* VISTA DE DETALHE DA TAREFA SELECIONADA */}
            {selectedTask ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs">
                    {selectedTask.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Duração estimada: {selectedTask.duration}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-5">{selectedTask.title}</h2>
                <p className="text-sm font-medium text-blue-800 mt-1">{selectedTask.summary}</p>

                <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-sm leading-relaxed">
                  {selectedTask.details}
                </div>

                {/* Botões de Ação: Voltar sem alterar + Marcar/Desmarcar Concluída */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>

                  <button
                    onClick={() => toggleTaskCompletionAndReturn(selectedTask.id)}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow transition ${
                      completedTaskIds.includes(selectedTask.id)
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedTaskIds.includes(selectedTask.id)
                      ? "Desmarcar como Concluída"
                      : "Marcar como Concluída"}
                  </button>
                </div>
              </div>
            ) : (
              /* LISTA COMPLETA DO PERCURSO */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">O Meu Percurso de Onboarding</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Clica em cada atividade para consultar as orientações e registar o teu progresso.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-blue-800">{progressPercent}%</span>
                    <p className="text-xs text-slate-500">
                      {completedTaskIds.length}/{tasks.length} concluídas
                    </p>
                  </div>
                </div>

                {/* Espaço Dedicado ao Mentor Docente */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/70 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                      RM
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        O Teu Mentor Docente (Teacher Buddy)
                      </span>
                      <h3 className="font-bold text-slate-900">Prof. Rui Martins</h3>
                      <p className="text-xs text-slate-600">
                        Disponível para acompanhar a tua integração pedagógica e técnica nos primeiros 30 dias.
                      </p>
                    </div>
                  </div>
                  <a
                    href="mailto:rui.martins@umo.pt"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-800 font-semibold text-xs shrink-0 transition"
                  >
                    Contactar Mentor
                  </a>
                </div>

                {/* Lista de Tarefas */}
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isDone = completedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all flex items-center justify-between gap-4 hover:shadow-md ${
                          isDone ? "border-teal-200 bg-teal-50/20" : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-teal-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`font-bold text-base ${
                                  isDone ? "line-through text-slate-400" : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </h3>
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {task.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{task.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline text-xs text-slate-400">{task.duration}</span>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            SECÇÃO 3: AGENDA DO DIA + MINI-INQUÉRITO FINAL
           ================================================================ */}
        {activeTab === "agenda" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Agenda de Integração (Dia 1)</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Programa detalhado de boas-vindas, formação nas plataformas e mentoria.
                </p>
              </div>
              <button
                onClick={handleExportOutlookICS}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition shrink-0"
              >
                <Download className="w-4 h-4" />
                Sincronizar com Outlook (.ics)
              </button>
            </div>

            {/* Cronograma */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 transition"
                >
                  <div className="sm:w-44 shrink-0 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold text-sm">
                      {item.hora}
                    </span>
                    <span className="text-xs font-medium text-slate-500">({item.duracao})</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.acao}</p>
                  </div>
                  <span className="self-start sm:self-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                    {item.tipo}
                  </span>
                </div>
              ))}
            </div>

            {/* MINI-INQUÉRITO FINAL (3 PERGUNTAS, ESCALA DE 1 A 5) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Mini-inquérito final (Balanço do Dia)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Avalia a tua experiência de hoje numa escala de 1 (Discordo totalmente) a 5 (Concordo totalmente).
                  </p>
                </div>
              </div>

              {surveySubmitted ? (
                <div className="mt-6 p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold">Obrigado pelo teu feedback!</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      As tuas respostas foram registadas para melhorar continuamente o acolhimento na UMO.
                    </p>
                  </div>
                  <button
                    onClick={() => setSurveySubmitted(false)}
                    className="text-xs font-semibold underline text-teal-800"
                  >
                    Editar respostas
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSurveySubmit} className="mt-6 space-y-5">
                  {[
                    { key: "q1", label: "1. Senti-me bem-vindo/a hoje." },
                    { key: "q2", label: "2. Sei o que se espera de mim nas próximas semanas." },
                    { key: "q3", label: "3. Sei a quem recorrer quando tiver dúvidas." }
                  ].map((q) => (
                    <div
                      key={q.key}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <span className="text-sm font-semibold text-slate-800">{q.label}</span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSurveyAnswers({ ...surveyAnswers, [q.key]: num })}
                            className={`w-9 h-9 rounded-xl font-bold text-sm transition ${
                              surveyAnswers[q.key] === num
                                ? "bg-blue-700 text-white shadow"
                                : "bg-white border border-slate-300 text-slate-700 hover:border-blue-500"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={!surveyAnswers.q1 || !surveyAnswers.q2 || !surveyAnswers.q3}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold text-sm transition"
                  >
                    Submeter Avaliação
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================================================================
            SECÇÃO 4: COMUNIDADE & CONTACTOS
           ================================================================ */}
        {activeTab === "comunidade" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Comunidade & Contactos UMO</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Equipa de coordenação, mentoria e serviços de apoio ao corpo docente.
                </p>
              </div>
              <a
                href="https://teams.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shrink-0"
              >
                Comunidade no Microsoft Teams <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contacts.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-700 text-white font-bold flex items-center justify-center text-sm mb-4">
                      {person.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{person.nome}</h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">{person.cargo}</p>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{person.area}</p>
                  </div>

                  <a
                    href={`mailto:${person.email}`}
                    className="mt-5 pt-4 border-t border-slate-100 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {person.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            SECÇÃO 5: RECURSOS DIGITAIS COM PESQUISA
           ================================================================ */}
        {activeTab === "recursos" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Biblioteca de Recursos</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manuais, regulamentos e modelos oficiais para a docência na UMO.
                </p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Pesquisar recursos..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800">
                      {res.categoria}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-3">{res.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{res.descricao}</p>
                  </div>

                  <a
                    href={res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 pt-4 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Aceder ao Documento <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          BOTÃO FLUTUANTE E JANELA DO ASSISTENTE VIRTUAL: TEACHER BUDDY
         ==================================================================== */}
      {!buddyOpen && (
        <button
          onClick={() => setBuddyOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-teal-600 to-blue-800 text-white font-semibold text-sm shadow-xl hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Teacher Buddy</span>
        </button>
      )}

      {buddyOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-teal-600 to-blue-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm leading-none">Teacher Buddy UMO</p>
                <p className="text-[11px] text-teal-100 mt-0.5">Suporte Contínuo 24/7</p>
              </div>
            </div>
            <button onClick={() => setBuddyOpen(false)} className="p-1 rounded-lg hover:bg-white/15">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-700 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escreve a tua dúvida..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
