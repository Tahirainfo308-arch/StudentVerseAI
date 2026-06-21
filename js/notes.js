(function() {

  function getNotifs() {
    try { return JSON.parse(localStorage.getItem('sv-notifications')) || []; } catch(e) { return []; }
  }
  function saveNotifs(n) { localStorage.setItem('sv-notifications', JSON.stringify(n)); }
  function addNotif(title, text, icon, page) {
    var notifs = getNotifs();
    notifs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      title: title,
      text: text,
      icon: icon || '&#128276;',
      page: page || 'general',
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      read: false
    });
    saveNotifs(notifs);
  }

  var regCourses = [
    {courseId:"CS-101",name:"Data Structures & Algorithms",category:"Software Engineering"},
    {courseId:"CS-102",name:"Software Engineering",category:"Software Engineering"},
    {courseId:"CS-201",name:"Database Systems",category:"Databases"},
    {courseId:"CS-202",name:"Computer Networks",category:"Systems & Networking"},
    {courseId:"CS-301",name:"Artificial Intelligence",category:"Data Science & AI"},
    {courseId:"CS-302",name:"Machine Learning Fundamentals",category:"Data Science & AI"},
    {courseId:"WEB-101",name:"HTML & CSS Foundations",category:"Development (Frontend)"},
    {courseId:"WEB-201",name:"JavaScript & DOM Manipulation",category:"Development (Frontend)"},
    {courseId:"WEB-301",name:"React.js Development",category:"Development (Frontend)"},
    {courseId:"WEB-302",name:"TypeScript & Modern Frontend",category:"Development (Frontend)"},
    {courseId:"WEB-401",name:"Node.js & Express Backend",category:"Development (Backend)"},
    {courseId:"WEB-402",name:"Python & Django Backend",category:"Development (Backend)"},
    {courseId:"WEB-403",name:"API Design & GraphQL",category:"Development (Backend)"},
    {courseId:"CLD-201",name:"AWS Cloud Practitioner",category:"Cloud & DevOps"},
    {courseId:"CLD-301",name:"Docker & Containerization",category:"Cloud & DevOps"},
    {courseId:"CLD-302",name:"Kubernetes Orchestration",category:"Cloud & DevOps"},
    {courseId:"CLD-303",name:"CI/CD & DevOps Pipelines",category:"Cloud & DevOps"},
    {courseId:"SEC-301",name:"Cybersecurity Fundamentals",category:"Cybersecurity"},
    {courseId:"SEC-302",name:"Ethical Hacking & Penetration Testing",category:"Cybersecurity"},
    {courseId:"SEC-303",name:"Blockchain & Web3 Security",category:"Cybersecurity"},
    {courseId:"DS-101",name:"Python for Data Science",category:"Data Science & AI"},
    {courseId:"DS-201",name:"Deep Learning & Neural Networks",category:"Data Science & AI"},
    {courseId:"DS-301",name:"Natural Language Processing",category:"Data Science & AI"},
    {courseId:"MOB-201",name:"React Native Development",category:"Mobile Development"},
    {courseId:"MOB-301",name:"Flutter & Dart Development",category:"Mobile Development"},
    {courseId:"MOB-302",name:"iOS Development with Swift",category:"Mobile Development"},
    {courseId:"DB-301",name:"NoSQL & MongoDB",category:"Databases"},
    {courseId:"DB-302",name:"PostgreSQL & Advanced SQL",category:"Databases"},
    {courseId:"SYS-301",name:"Operating Systems",category:"Systems & Networking"},
    {courseId:"SYS-401",name:"System Design & Architecture",category:"Software Engineering"}
  ];

  function getEnrolledIds() {
    var u = JSON.parse(localStorage.getItem('sv-user') || '{}');
    var raw = u.enrolledCourses || [];
    return raw.map(function(x){ return typeof x === 'string' ? x : (x.id || x.courseId); });
  }

  function getEnrolledCourses() {
    var ids = getEnrolledIds();
    return ids.map(function(id){ return regCourses.find(function(c){ return c.courseId === id; }); }).filter(Boolean);
  }

  function getNotes() {
    return JSON.parse(localStorage.getItem('sv-notes') || '[]');
  }

  function saveNotes(arr) {
    localStorage.setItem('sv-notes', JSON.stringify(arr));
  }

  var translations = {
    en: {
      title:"Study Notes",
      subtitle:"Upload and manage notes for your enrolled courses.",
      searchPlaceholder:"Search notes by title or course...",
      allSubjects:"All Courses",
      allSemesters:"All Semesters",
      uploadBtn:"Upload Notes",
      uploadModalTitle:"Upload Notes",
      notesTitle:"Notes Title",
      notesTitlePlaceholder:"e.g. Chapter 1 Summary",
      subject:"Course",
      selectSubject:"Select Course",
      topic:"Topic / Chapter",
      topicPlaceholder:"e.g. Chapter 1, Linear Equations, etc.",
      description:"Description",
      descPlaceholder:"Brief details about these notes...",
      fileUpload:"Drag & drop or click to upload PDF/File",
      uploadNow:"Upload Now",
      view:"View",
      download:"Download",
      delete:"Delete",
      emptyState:"No notes yet. Upload your first note!",
      saved:"Saved Notes",
      by:"By",
      sub:"Course",
      removedFromSaved:"Removed from saved",
      noteSaved:"Note saved!",
      noteUploaded:"Notes uploaded!",
      downloadStarted:"Download started!",
      noteDeleted:"Note deleted!",
      viewNote:"Viewing note",
      noCourses:"No enrolled courses found. Please register for courses first."
    },
    ur: {
      title:"نوٹس",
      subtitle:"اپنے اندراج کردہ کورسز کے نوٹس اپ لوڈ اور منظم کریں۔",
      searchPlaceholder:"نوٹس کو عنوان یا کورس سے تلاش کریں...",
      allSubjects:"تمام کورسز",
      allSemesters:"تمام سمسٹر",
      uploadBtn:"نوٹس اپ لوڈ کریں",
      uploadModalTitle:"نوٹس اپ لوڈ کریں",
      notesTitle:"نوٹس کا عنوان",
      notesTitlePlaceholder:"مثلاً باب 1 کا خلاصہ",
      subject:"کورس",
      selectSubject:"کورس منتخب کریں",
      topic:"موضوع / باب",
      topicPlaceholder:"مثلاً باب 1، لکیری مساوات، وغیرہ",
      description:"تفصیل",
      descPlaceholder:"ان نوٹس کے بارے میں مختصر تفصیلات...",
      fileUpload:"PDF/فائل اپ لوڈ کرنے کے لیے کلک کریں",
      uploadNow:"اپ لوڈ کریں",
      view:"دیکھیں",
      download:"ڈاؤن لوڈ",
      delete:"حذف کریں",
      emptyState:"ابھی تک کوئی نوٹس نہیں۔ اپنا پہلا نوٹس اپ لوڈ کریں!",
      saved:"محفوظ نوٹس",
      by:"اپ لوڈ کردہ",
      sub:"کورس",
      removedFromSaved:"محفوظ سے ہٹا دیا گیا",
      noteSaved:"نوٹس محفوظ ہو گیا!",
      noteUploaded:"نوٹس اپ لوڈ ہو گئے!",
      downloadStarted:"ڈاؤن لوڈ شروع!",
      noteDeleted:"نوٹس حذف ہو گیا!",
      viewNote:"نوٹس دیکھ رہے ہیں",
      noCourses:"کوئی اندراج شدہ کورس نہیں ملا۔ براہ کرم پہلے کورسز میں اندراج کریں۔"
    },
    es: {
      title:"Notas de Estudio",
      subtitle:"Sube y administra notas para tus cursos inscritos.",
      searchPlaceholder:"Buscar notas por título o curso...",
      allSubjects:"Todos los Cursos",
      allSemesters:"Todos los Semestres",
      uploadBtn:"Subir Notas",
      uploadModalTitle:"Subir Notas",
      notesTitle:"Título de Notas",
      notesTitlePlaceholder:"ej. Resumen del Capítulo 1",
      subject:"Curso",
      selectSubject:"Seleccionar Curso",
      topic:"Tema / Capítulo",
      topicPlaceholder:"ej. Capítulo 1, Ecuaciones Lineales, etc.",
      description:"Descripción",
      descPlaceholder:"Breves detalles sobre estas notas...",
      fileUpload:"Arrastra o haz clic para subir PDF/Archivo",
      uploadNow:"Subir Ahora",
      view:"Ver",
      download:"Descargar",
      delete:"Eliminar",
      emptyState:"Aún no hay notas. ¡Sube tu primera nota!",
      saved:"Notas Guardadas",
      by:"Por",
      sub:"Curso",
      removedFromSaved:"Eliminado de guardados",
      noteSaved:"Nota guardada!",
      noteUploaded:"Notas subidas!",
      downloadStarted:"Descarga iniciada!",
      noteDeleted:"Nota eliminada!",
      viewNote:"Viendo nota",
      noCourses:"No se encontraron cursos inscritos. Regístrate en cursos primero."
    },
    ar: {
      title:"ملاحظات الدراسة",
      subtitle:"قم برفع وإدارة ملاحظات مساقاتك المسجلة.",
      searchPlaceholder:"ابحث في الملاحظات بالعنوان أو المساق...",
      allSubjects:"جميع المساقات",
      allSemesters:"جميع الفصول",
      uploadBtn:"رفع ملاحظات",
      uploadModalTitle:"رفع ملاحظات",
      notesTitle:"عنوان الملاحظات",
      notesTitlePlaceholder:"مثال: ملخص الفصل 1",
      subject:"المساق",
      selectSubject:"اختر المساق",
      topic:"الموضوع / الفصل",
      topicPlaceholder:"مثال: الفصل 1، المعادلات الخطية، إلخ",
      description:"الوصف",
      descPlaceholder:"تفاصيل مختصرة عن هذه الملاحظات...",
      fileUpload:"اسحب أو انقر لرفع ملف PDF",
      uploadNow:"رفع الآن",
      view:"عرض",
      download:"تحميل",
      delete:"حذف",
      emptyState:"لا توجد ملاحظات بعد. قم برفع أول ملاحظة!",
      saved:"الملاحظات المحفوظة",
      by:"بواسطة",
      sub:"المساق",
      removedFromSaved:"تمت الإزالة من المحفوظات",
      noteSaved:"تم حفظ الملاحظة!",
      noteUploaded:"تم رفع الملاحظات!",
      downloadStarted:"بدأ التحميل!",
      noteDeleted:"تم حذف الملاحظة!",
      viewNote:"عرض الملاحظة",
      noCourses:"لم يتم العثور على مساقات مسجلة. يرجى التسجيل في المساقات أولاً."
    }
  };

  var currentLang = localStorage.getItem('sv-lang') || 'en';

  function t(key) {
    return translations[currentLang]?.[key] || translations.en[key] || key;
  }

  var savedTheme = localStorage.getItem('sv-theme') || 'light';
  var html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);

  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  var langSelect = document.getElementById('langSelect');

  if (themeIcon) { themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; }
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var cur = html.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('sv-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', function() {
      currentLang = this.value;
      localStorage.setItem('sv-lang', currentLang);
      applyLanguage();
    });
  }

  function applyLanguage() {
    document.querySelector('[data-i18n="title"]').textContent = t('title');
    document.querySelector('[data-i18n="subtitle"]').textContent = t('subtitle');
    document.querySelector('[data-i18n="searchPlaceholder"]').placeholder = t('searchPlaceholder');
    document.querySelector('[data-i18n="uploadBtn"]').innerHTML = '<i class="fas fa-plus"></i> ' + t('uploadBtn');
    document.querySelector('[data-i18n="uploadModalTitle"]').textContent = t('uploadModalTitle');
    document.querySelector('[data-i18n="notesTitle"]').textContent = t('notesTitle');
    document.querySelector('[data-i18n="notesTitlePlaceholder"]').placeholder = t('notesTitlePlaceholder');
    document.querySelector('[data-i18n="subject"]').textContent = t('subject');
    document.querySelector('[data-i18n="selectSubject"]').textContent = t('selectSubject');
    document.querySelector('[data-i18n="topic"]').textContent = t('topic');
    document.querySelector('[data-i18n="topicPlaceholder"]').placeholder = t('topicPlaceholder');
    document.querySelector('[data-i18n="description"]').textContent = t('description');
    document.querySelector('[data-i18n="descPlaceholder"]').placeholder = t('descPlaceholder');
    document.querySelector('[data-i18n="fileUpload"]').innerHTML = '<i class="fas fa-cloud-upload-alt file-icon"></i><p>' + t('fileUpload') + '</p>';
    document.querySelector('[data-i18n="uploadNow"]').innerHTML = '<i class="fas fa-upload"></i> ' + t('uploadNow');
    applyFilters();
  }

  var categoryContainer = document.getElementById('categoryContainer');
  var filterSubject = document.getElementById('filterSubject');
  var searchInput = document.getElementById('searchInput');
  var grid = document.getElementById('notesGrid');
  var currentCategory = "All";

  function buildDynamicUI() {
    var courses = getEnrolledCourses();

    if (courses.length === 0) {
      categoryContainer.innerHTML = '<p style="color:var(--text-muted);padding:10px 0;">' + t('noCourses') + '</p>';
      filterSubject.innerHTML = '<option value="All">' + t('allSubjects') + '</option>';
      return;
    }

    categoryContainer.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.dataset.subject = 'All';
    allBtn.textContent = 'All (' + courses.length + ')';
    allBtn.addEventListener('click', function(){ setCategory('All'); });
    categoryContainer.appendChild(allBtn);

    courses.forEach(function(c) {
      var btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.dataset.subject = c.courseId;
      btn.textContent = c.name;
      btn.addEventListener('click', function(){ setCategory(c.courseId); });
      categoryContainer.appendChild(btn);
    });

    var savedBtn = document.createElement('button');
    savedBtn.className = 'category-btn saved-tab';
    savedBtn.dataset.subject = 'Saved';
    savedBtn.innerHTML = '<i class="fas fa-bookmark"></i> ' + t('saved');
    savedBtn.addEventListener('click', function(){ setCategory('Saved'); });
    categoryContainer.appendChild(savedBtn);

    filterSubject.innerHTML = '<option value="All">' + t('allSubjects') + '</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.courseId;
      opt.textContent = c.name;
      filterSubject.appendChild(opt);
    });
  }

  function setCategory(cat) {
    currentCategory = cat;
    var btns = categoryContainer.querySelectorAll('.category-btn');
    btns.forEach(function(b){ b.classList.remove('active'); });
    var target = categoryContainer.querySelector('[data-subject="' + cat + '"]');
    if (target) target.classList.add('active');
    if (cat !== 'Saved' && cat !== 'All') { filterSubject.value = cat; }
    else { filterSubject.value = 'All'; }
    applyFilters();
  }

  function getCourseName(courseId) {
    var c = regCourses.find(function(x){ return x.courseId === courseId; });
    return c ? c.name : courseId;
  }

  function getCourseIcon(courseId) {
    var name = (getCourseName(courseId) || courseId).toLowerCase();
    if (name.indexOf('html') > -1 || name.indexOf('css') > -1) return 'fa-code';
    if (name.indexOf('javascript') > -1 || name.indexOf('js') > -1 || name.indexOf('react') > -1 || name.indexOf('typescript') > -1) return 'fa-js';
    if (name.indexOf('python') > -1 || name.indexOf('data') > -1 || name.indexOf('machine') > -1 || name.indexOf('deep') > -1 || name.indexOf('nlp') > -1) return 'fa-python';
    if (name.indexOf('node') > -1 || name.indexOf('express') > -1 || name.indexOf('django') > -1 || name.indexOf('api') > -1 || name.indexOf('graphql') > -1) return 'fa-server';
    if (name.indexOf('database') > -1 || name.indexOf('sql') > -1 || name.indexOf('mongodb') > -1 || name.indexOf('nosql') > -1) return 'fa-database';
    if (name.indexOf('aws') > -1 || name.indexOf('cloud') > -1 || name.indexOf('docker') > -1 || name.indexOf('kubernetes') > -1 || name.indexOf('devops') > -1 || name.indexOf('ci/cd') > -1) return 'fa-cloud';
    if (name.indexOf('security') > -1 || name.indexOf('cyber') > -1 || name.indexOf('hacking') > -1 || name.indexOf('blockchain') > -1) return 'fa-shield-alt';
    if (name.indexOf('mobile') > -1 || name.indexOf('react native') > -1 || name.indexOf('flutter') > -1 || name.indexOf('swift') > -1 || name.indexOf('ios') > -1) return 'fa-mobile-alt';
    if (name.indexOf('network') > -1 || name.indexOf('system') > -1) return 'fa-network-wired';
    if (name.indexOf('algorithms') > -1 || name.indexOf('structure') > -1) return 'fa-sitemap';
    return 'fa-book';
  }

  var modal = document.getElementById('uploadModal');
  var btnOpen = document.getElementById('openUploadModal');
  var btnClose = document.getElementById('closeModal');

  if (btnOpen) btnOpen.addEventListener('click', function(){ buildUploadSubjectOptions(); modal.classList.add('active'); });
  if (btnClose) btnClose.addEventListener('click', function(){ modal.classList.remove('active'); });
  if (modal) {
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('active'); });
  }

  function buildUploadSubjectOptions() {
    var sel = document.getElementById('upSubject');
    if (!sel) return;
    var courses = getEnrolledCourses();
    sel.innerHTML = '<option value="" disabled selected>' + t('selectSubject') + '</option>';
    courses.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.courseId;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  var uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var submitBtn = uploadForm.querySelector('button[type="submit"]');
      var origBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      submitBtn.disabled = true;

      var title = document.getElementById('upTitle').value;
      var courseId = document.getElementById('upSubject').value;
      var topic = document.getElementById('upTopic').value;
      var desc = document.getElementById('upDesc').value;
      var fileInput = document.getElementById('upFile');

      var courseName = getCourseName(courseId);
      var icon = getCourseIcon(courseId);

      var today = new Date();
      var dateStr = today.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

      function finalizeNote(fileData) {
        var newNote = {
          id: Date.now(),
          title: title,
          uploader: 'You (Student)',
          date: dateStr,
          courseId: courseId,
          courseName: courseName,
          topic: topic,
          icon: icon,
          desc: desc,
          fileName: fileInput && fileInput.files[0] ? fileInput.files[0].name : '',
          fileData: fileData || null
        };

        var notes = getNotes();
        notes.unshift(newNote);
        saveNotes(notes);

        modal.classList.remove('active');
        e.target.reset();
        submitBtn.innerHTML = origBtnHtml;
        submitBtn.disabled = false;
        applyFilters();
        showUploadSuccess();
        addNotif('Notes Uploaded', '"' + title + '" uploaded for ' + courseName, '&#128196;', 'notes');
      }

      var file = fileInput && fileInput.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onprogress = function(ev) {
          if (ev.lengthComputable) {
            var pct = Math.round(ev.loaded / ev.total * 100);
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + pct + '%';
          }
        };
        reader.onload = function(ev) { finalizeNote(ev.target.result); };
        reader.readAsDataURL(file);
      } else {
        finalizeNote(null);
      }
    });
  }

  function showUploadSuccess() {
    var existing = document.querySelector('.upload-popup');
    if (existing) existing.remove();
    var popup = document.createElement('div');
    popup.className = 'upload-popup';
    popup.innerHTML = '<div class="upload-popup-inner"><i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);margin-bottom:12px;"></i><div style="font-size:1.1rem;font-weight:600;">Saved!</div><div style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">Notes uploaded successfully</div></div>';
    document.body.appendChild(popup);
    setTimeout(function() { popup.classList.add('show'); }, 50);
    setTimeout(function() { popup.classList.remove('show'); setTimeout(function() { popup.remove(); }, 400); }, 2000);
  }

  function getSavedNotes() {
    return JSON.parse(localStorage.getItem('sv-saved-notes')) || [];
  }

  function saveSavedNotes(arr) {
    localStorage.setItem('sv-saved-notes', JSON.stringify(arr));
  }

  function toggleSave(id) {
    var savedNotes = getSavedNotes();
    var idx = savedNotes.indexOf(id);
    if (idx > -1) { savedNotes.splice(idx, 1); showToast(t('removedFromSaved'), 'info'); }
    else { savedNotes.push(id); showToast(t('noteSaved'), 'success'); }
    saveSavedNotes(savedNotes);
    applyFilters();
    var notes = getNotes();
    var note = notes.find(function(n){ return n.id === id; });
    if (note) addNotif('Note ' + (idx > -1 ? 'Unsaved' : 'Saved'), '"' + note.title + '" ' + (idx > -1 ? 'removed from' : 'added to') + ' saved notes.', '&#128151;', 'notes');
  }

  function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    var notes = getNotes();
    var note = notes.find(function(n){ return n.id === id; });
    notes = notes.filter(function(n){ return n.id !== id; });
    saveNotes(notes);
    var savedNotes = getSavedNotes();
    var idx = savedNotes.indexOf(id);
    if (idx > -1) { savedNotes.splice(idx, 1); saveSavedNotes(savedNotes); }
    applyFilters();
    showToast(t('noteDeleted'), 'error');
    if (note) addNotif('Note Deleted', '"' + note.title + '" has been deleted.', '&#128465;', 'notes');
  }

  function downloadNote(id) {
    var notes = getNotes();
    var note = notes.find(function(n){ return n.id === id; });
    if (!note) return;
    if (note.fileData) {
      var blobUrl = dataUrlToBlobUrl(note.fileData);
      if (!blobUrl) return;
      var a = document.createElement('a');
      a.href = blobUrl;
      a.download = note.fileName || (note.title || 'notes').replace(/[^a-zA-Z0-9]/g,'_') + '.bin';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 1000);
    } else {
      var fileContent = 'Title: ' + note.title + '\nCourse: ' + note.courseName + '\nDate: ' + note.date + '\nDescription:\n' + note.desc;
      var blob = new Blob([fileContent], { type:'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (note.title || 'notes').replace(/[^a-zA-Z0-9]/g,'_') + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    showToast(t('downloadStarted'), 'success');
    addNotif('Note Downloaded', '"' + note.title + '" downloaded.', '&#128229;', 'notes');
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = 'toast';
    if (type === 'success') toast.classList.add('success');
    else if (type === 'error') toast.classList.add('error');
    var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 3000);
  }
  
  function escHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function dataUrlToBlobUrl(dataUrl) {
    try {
      var parts = dataUrl.split(',');
      var mime = parts[0].match(/:(.*?);/)[1] || 'application/octet-stream';
      var raw = atob(parts[1]);
      var u8 = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
      var blob = new Blob([u8], { type: mime });
      return URL.createObjectURL(blob);
    } catch(e) { return null; }
  }

  function viewNote(id) {
    var notes = getNotes();
    var note = notes.find(function(n){ return n.id === id; });
    if (!note) return;

    if (note.fileData) {
      var blobUrl = dataUrlToBlobUrl(note.fileData);
      if (blobUrl) {
        window.open(blobUrl, '_blank');
        setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 1000);
      }
      return;
    }

    document.getElementById('viewNoteTitle').textContent = note.title || 'Untitled';
    document.getElementById('viewNoteBody').innerHTML =
      '<div class="note-meta">' +
        '<span><i class="fas fa-user"></i> ' + escHtml(note.uploader) + '</span>' +
        '<span><i class="fas fa-book"></i> ' + escHtml(note.courseName) + '</span>' +
        '<span><i class="fas fa-tag"></i> ' + escHtml(note.topic || note.sem || '-') + '</span>' +
        '<span><i class="far fa-calendar"></i> ' + escHtml(note.date) + '</span>' +
        (note.fileName ? '<span><i class="fas fa-paperclip"></i> ' + escHtml(note.fileName) + '</span>' : '') +
      '</div>' +
      (note.desc ? '<div class="note-desc">' + escHtml(note.desc) + '</div>' : '');
    document.getElementById('viewNoteModal').classList.add('active');
  }

  document.getElementById('closeViewModal').addEventListener('click', function() {
    document.getElementById('viewNoteModal').classList.remove('active');
  });
  document.getElementById('viewNoteModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });

  function exportAllNotes() {
    var notes = getNotes();
    if (notes.length === 0) { showToast('No notes to export.', 'info'); return; }
    var exportData = JSON.stringify(notes, null, 2);
    var blob = new Blob([exportData], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'StudentVerseAI_Notes_Export_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Notes exported successfully!', 'success');
    addNotif('Notes Exported', 'All notes exported as JSON successfully.', '&#128230;', 'notes');
  }

  document.getElementById('exportNotesBtn').addEventListener('click', exportAllNotes);

  function renderNotes(data) {
    if (!grid) return;
    grid.innerHTML = '';

    if (data.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">' +
        '<i class="fas fa-folder-open" style="font-size:3.5rem;margin-bottom:16px;opacity:0.4;display:block;"></i>' +
        '<p style="font-size:1rem;">' + t('emptyState') + '</p></div>';
      return;
    }

    var savedNotes = getSavedNotes();

    data.forEach(function(note) {
      var isSaved = savedNotes.indexOf(note.id) > -1;
      var card = document.createElement('div');
      card.className = 'note-card';
      card.dataset.id = note.id;
      card.innerHTML =
        '<button class="save-btn ' + (isSaved ? 'saved' : '') + '" data-action="save" title="' + (isSaved ? 'Remove from saved' : 'Save note') + '">' +
          '<i class="' + (isSaved ? 'fas' : 'far') + ' fa-bookmark"></i>' +
        '</button>' +
        '<div class="card-icon"><i class="fas ' + note.icon + '"></i></div>' +
        '<h3>' + note.title + '</h3>' +
        '<div class="card-details">' +
          '<div><i class="fas fa-user"></i> ' + t('by') + ': ' + note.uploader + '</div>' +
          '<div><i class="fas fa-book"></i> ' + t('sub') + ': ' + note.courseName + '</div>' +
          '<div><i class="fas fa-tag"></i> Topic: ' + (note.topic || note.sem || '-') + '</div>' +
          '<div><i class="far fa-calendar"></i> ' + note.date + '</div>' +
          (note.fileName ? '<div><i class="fas fa-paperclip"></i> ' + note.fileName + '</div>' : '') +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="btn-view" data-action="view"><i class="fas fa-eye"></i> ' + t('view') + '</button>' +
          '<button class="btn-download" data-action="download"><i class="fas fa-download"></i> ' + t('download') + '</button>' +
          '<button class="btn-delete" data-action="delete"><i class="fas fa-trash"></i> ' + t('delete') + '</button>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  if (grid) {
    grid.addEventListener('click', function(e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var card = btn.closest('.note-card');
      if (!card) return;
      var id = Number(card.dataset.id);
      var action = btn.dataset.action;
      if (action === 'save') toggleSave(id);
      else if (action === 'view') viewNote(id);
      else if (action === 'download') downloadNote(id);
      else if (action === 'delete') deleteNote(id);
    });
  }

  function applyFilters() {
    var courses = getEnrolledCourses();
    if (courses.length === 0) {
      if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">' +
        '<i class="fas fa-exclamation-circle" style="font-size:3rem;margin-bottom:16px;opacity:0.4;display:block;"></i>' +
        '<p>' + t('noCourses') + '</p></div>';
      return;
    }

    var allNotes = getNotes();
    var searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    var subVal = filterSubject ? filterSubject.value : 'All';
    var savedNotes = getSavedNotes();

    var filtered = allNotes.filter(function(note) {
      var matchSearch = note.title.toLowerCase().indexOf(searchVal) > -1 || (note.courseName || '').toLowerCase().indexOf(searchVal) > -1;
      var matchSub = subVal === 'All' || note.courseId === subVal || note.subject === subVal;
      var matchCategory = true;
      if (currentCategory === 'Saved') matchCategory = savedNotes.indexOf(note.id) > -1;
      else if (currentCategory !== 'All') matchCategory = note.courseId === currentCategory || note.subject === currentCategory;
      return matchSearch && matchSub && matchCategory;
    });

    renderNotes(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterSubject) filterSubject.addEventListener('change', function(){ setCategory(filterSubject.value); });

  buildDynamicUI();
  applyLanguage();

  window.showToast = showToast;

})();
