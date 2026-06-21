(function() {
'use strict';

/* ===== THEME ===== */
(function initTheme() {
  const t = localStorage.getItem('sv-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

/* ===== HELPERS ===== */
function $(id) { return document.getElementById(id); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function getNotifs() { try { return JSON.parse(localStorage.getItem('sv-notifications')) || []; } catch(e) { return []; } }
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

/* ===== STORAGE ===== */
const Store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  getUser() { return this.get('sv-user') || null; },
  getProfile() { return this.get('sv-profile-data'); },
  setProfile(p) { this.set('sv-profile-data', p); }
};

/* ===== DEFAULTS ===== */
function emptyProfile(user) {
  return {
    basicInfo: {
      fullName: (user && user.name) || '',
      email: (user && user.email) || '',
      university: (user && user.university) || '',
      department: (user && user.department) || '',
      semester: (user && user.semester ? user.semester.replace('Semester ','') : '')
    },
    profilePhoto: null,
    coverPhoto: null,
    bio: { bio: '', academicInterests: '', careerGoals: '', personalIntroduction: '' },
    qualifications: [],
    skills: [],
    resume: null,
    socialLinks: { linkedin: '', github: '', portfolio: '', behance: '', dribbble: '' },
    projects: [],
    certifications: [],
    experience: [],
    achievements: [],
    privacy: 'public'
  };
}

/* ===== PROFILE ===== */
const Profile = {
  _cached: null,
  get() {
    if (this._cached) return this._cached;
    const user = Store.getUser();
    let p = Store.getProfile();
    if (!p) {
      p = emptyProfile(user);
      Store.setProfile(p);
    } else {
      var modified = false;
      if (!p.basicInfo) { p.basicInfo = emptyProfile(user).basicInfo; modified = true; }
      if (!p.bio) { p.bio = emptyProfile().bio; modified = true; }
      if (!p.qualifications && p.academicInfo) {
        var a = p.academicInfo;
        p.qualifications = [{
          id: uid(),
          type: 'University',
          name: a.university || '',
          department: a.department || '',
          semester: a.semester || '',
          degree: a.degreeProgram || '',
          graduation: a.expectedGraduation || '',
          location: ''
        }];
        delete p.academicInfo;
        modified = true;
      }
      if (!p.qualifications) { p.qualifications = []; modified = true; }
      if (!p.skills) { p.skills = []; modified = true; }
      if (!p.resume) p.resume = null;
      if (!p.socialLinks) { p.socialLinks = emptyProfile().socialLinks; modified = true; }
      if (!p.projects) { p.projects = []; modified = true; }
      if (!p.certifications) { p.certifications = []; modified = true; }
      if (!p.experience) { p.experience = []; modified = true; }
      if (!p.achievements) { p.achievements = []; modified = true; }
      if (!p.privacy) { p.privacy = 'public'; modified = true; }
      if (modified) Store.setProfile(p);
    }
    this._cached = p;
    return p;
  },
  save() {
    if (this._cached) Store.setProfile(this._cached);
  },
  invalidate() { this._cached = null; }
};

/* ===== COMPLETION ===== */
function calcCompletion(p) {
  if (!p) p = Profile.get();
  if (!p) return { percent: 0, details: [] };
  var checks = [
    { key:'photo', label:'Profile Photo', done: !!p.profilePhoto },
    { key:'cover', label:'Cover Photo', done: !!p.coverPhoto },
    { key:'bio', label:'Bio', done: !!(p.bio && p.bio.bio && p.bio.bio.trim()) },
    { key:'resume', label:'Resume', done: !!p.resume },
    { key:'skills', label:'Skills', done: !!(p.skills && p.skills.length > 0) },
    { key:'projects', label:'Projects', done: !!(p.projects && p.projects.length > 0) },
    { key:'qualifications', label:'Qualifications', done: !!(p.qualifications && p.qualifications.length > 0) },
    { key:'social', label:'Social Links', done: !!(
      p.socialLinks && (p.socialLinks.linkedin || p.socialLinks.github || p.socialLinks.portfolio || p.socialLinks.behance || p.socialLinks.dribbble)
    )}
  ];
  var done = checks.filter(function(c){ return c.done; }).length;
  var pct = Math.round((done / checks.length) * 100);
  return { percent: pct, details: checks };
}

/* ===== TOAST ===== */
function toast(msg) {
  var c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  c.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

/* ===== NAVIGATION ===== */
function navigateTo(section) {
  document.querySelectorAll('.section-content').forEach(function(s){ s.classList.remove('active'); });
  var el = $('section-' + section);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
  var nav = document.querySelector('.nav-item[data-section="' + section + '"]');
  if (nav) nav.classList.add('active');
  renderAll();
}

/* ===== RENDER FUNCTIONS ===== */
function renderAll() {
  renderCompletion();
  renderHeader();
  renderBasicInfo();
  renderPhoto();
  renderCover();
  renderBio();
  renderQualifications();
  renderSkills();
  renderResume();
  renderSocial();
  renderProjects();
  renderCerts();
  renderExp();
  renderAchievements();
  renderPrivacy();
}

function renderCompletion() {
  var p = Profile.get();
  if (!p) return;
  var comp = calcCompletion(p);
  $('completionMainFill').style.width = comp.percent + '%';
  $('completionMainText').textContent = comp.percent + '% Complete';
  $('completionMiniFill').style.width = comp.percent + '%';
  $('completionMiniText').textContent = comp.percent + '%';
  $('completionItems').innerHTML = comp.details.map(function(d){
    return '<div class="completion-item ' + (d.done ? 'done' : '') + '">' +
      '<span class="check ' + (d.done ? 'done' : 'pending') + '">' + (d.done ? '&#10003;' : '&#9675;') + '</span>' +
      d.label + '</div>';
  }).join('');

  var bi = p.basicInfo || {};
  var b = p.bio || {};
  if (b.bio && b.bio.trim()) {
    $('overviewBioPreview').innerHTML = '<i class="fas fa-quote-left" style="color:var(--primary);"></i> ' + esc(b.bio);
  } else {
    $('overviewBioPreview').textContent = 'Add a short introduction about yourself.';
  }

  var stats = [
    { label:'Skills', count:(p.skills||[]).length },
    { label:'Projects', count:(p.projects||[]).length },
    { label:'Certifications', count:(p.certifications||[]).length },
    { label:'Experience', count:(p.experience||[]).length },
    { label:'Achievements', count:(p.achievements||[]).length }
  ];
  $('quickStats').innerHTML = stats.map(function(s){
    return '<div class="stat-mini"><div class="stat-num">' + s.count + '</div><div class="stat-label">' + s.label + '</div></div>';
  }).join('');
}

function renderHeader() {
  var p = Profile.get();
  var user = Store.getUser();
  if (!p) return;
  var bi = p.basicInfo || {};
  var qs = p.qualifications || [];
  var latest = qs.length ? qs[qs.length - 1] : {};
  $('profileName').textContent = bi.fullName || (user ? user.name : 'Student');
  $('profileUni').textContent = latest.name || bi.university || 'University';
  $('profileDept').textContent = latest.department || bi.department || 'Department';
  $('profileSem').textContent = latest.semester || bi.semester ? 'Semester ' + (latest.semester || bi.semester) : 'Semester';

  var coverWrap = $('coverWrapper');
  if (p.coverPhoto) {
    $('coverPlaceholder').style.display = 'none';
    $('coverImage').style.display = '';
    $('coverImage').src = p.coverPhoto;
  } else {
    $('coverPlaceholder').style.display = 'flex';
    $('coverImage').style.display = 'none';
  }

  var avWrap = document.querySelector('.profile-avatar-wrapper');
  if (p.profilePhoto) {
    $('avatarPlaceholder').style.display = 'none';
    $('avatarImage').style.display = '';
    $('avatarImage').src = p.profilePhoto;
  } else {
    $('avatarPlaceholder').style.display = 'flex';
    $('avatarImage').style.display = 'none';
    $('avatarLetter').textContent = (bi.fullName || user.name || '?')[0].toUpperCase();
  }
}

function renderBasicInfo() {
  var p = Profile.get();
  if (!p) return;
  var bi = p.basicInfo || {};
  $('basicName').value = bi.fullName || '';
  $('basicEmail').value = bi.email || '';
  $('basicUni').value = bi.university || '';
  $('basicDept').value = bi.department || '';
  $('basicSem').value = bi.semester || '';
}

function renderPhoto() {
  var p = Profile.get();
  if (!p) return;
  var prv = $('photoPreview');
  if (p.profilePhoto) {
    prv.innerHTML = '<img src="' + p.profilePhoto + '" alt="Profile" />';
    $('btnRemovePhoto').style.display = '';
  } else {
    prv.innerHTML = '<div class="upload-placeholder"><i class="fas fa-user"></i><span>No Photo</span></div>';
    $('btnRemovePhoto').style.display = 'none';
  }
}

function renderCover() {
  var p = Profile.get();
  if (!p) return;
  var prv = $('coverPreview');
  if (p.coverPhoto) {
    prv.innerHTML = '<img src="' + p.coverPhoto + '" alt="Cover" />';
    $('btnRemoveCover').style.display = '';
  } else {
    prv.innerHTML = '<div class="upload-placeholder"><i class="fas fa-image"></i><span>No Cover Image</span></div>';
    $('btnRemoveCover').style.display = 'none';
  }
}

function renderBio() {
  var p = Profile.get();
  if (!p) return;
  var b = p.bio || {};
  $('bioText').value = b.bio || '';
  $('bioInterests').value = b.academicInterests || '';
  $('bioCareer').value = b.careerGoals || '';
  $('bioIntro').value = b.personalIntroduction || '';
}

function renderQualifications() {
  var p = Profile.get();
  if (!p) return;
  var items = p.qualifications || [];
  var list = $('qualsList');
  var empty = $('qualsEmpty');
  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = items.map(function(q){
    return '<div class="item-card">' +
      '<div class="item-info"><h4>' + esc(q.name || '') + '</h4>' +
      '<span class="item-badge">' + esc(q.type || '') + '</span>' +
      (q.degree ? '<p>' + esc(q.degree) + '</p>' : '') +
      (q.department ? '<p style="margin-top:2px;font-size:13px;color:var(--text-muted);">' + esc(q.department) + '</p>' : '') +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;font-size:13px;color:var(--text-muted);">' +
      (q.semester ? '<span>Semester: ' + q.semester + '</span>' : '') +
      (q.graduation ? '<span>Year: ' + q.graduation + '</span>' : '') +
      (q.location ? '<span>' + esc(q.location) + '</span>' : '') +
      '</div></div>' +
      '<div class="item-actions">' +
      '<button class="btn btn-sm btn-outline edit-qual" data-id="' + q.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger delete-qual" data-id="' + q.id + '">Delete</button>' +
      '</div></div>';
  }).join('');
}

function renderSkills() {
  var p = Profile.get();
  if (!p) return;
  var skills = p.skills || [];
  var list = $('skillsList');
  var empty = $('skillsEmpty');
  if (skills.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    list.innerHTML = skills.map(function(s, i){
      return '<span class="skill-tag" data-index="' + i + '">' +
        '<span class="skill-name" data-index="' + i + '">' + esc(s) + '</span>' +
        '<span class="skill-remove" data-index="' + i + '">&times;</span></span>';
    }).join('');
  }
}

function renderResume() {
  var p = Profile.get();
  if (!p) return;
  var r = p.resume;
  if (r && r.data) {
    $('resumeEmpty').style.display = 'none';
    $('resumeInfo').style.display = '';
    $('resumeName').textContent = r.name || 'resume.pdf';
  } else {
    $('resumeEmpty').style.display = '';
    $('resumeInfo').style.display = 'none';
  }
}

function renderSocial() {
  var p = Profile.get();
  if (!p) return;
  var sl = p.socialLinks || {};
  $('socialLinkedin').value = sl.linkedin || '';
  $('socialGithub').value = sl.github || '';
  $('socialPortfolio').value = sl.portfolio || '';
  $('socialBehance').value = sl.behance || '';
  $('socialDribbble').value = sl.dribbble || '';
}

function renderProjects() {
  var p = Profile.get();
  if (!p) return;
  var items = p.projects || [];
  var list = $('projectsList');
  var empty = $('projectsEmpty');
  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = items.map(function(pr){
    return '<div class="item-card">' +
      '<div class="item-info"><h4>' + esc(pr.name) + '</h4>' +
      (pr.description ? '<p>' + esc(pr.description) + '</p>' : '') +
      (pr.technologies ? '<span class="item-badge">' + esc(pr.technologies) + '</span>' : '') +
      '<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">' +
      (pr.githubLink ? '<a href="' + esc(pr.githubLink) + '" target="_blank" style="font-size:12px;">GitHub</a>' : '') +
      (pr.demoLink ? '<a href="' + esc(pr.demoLink) + '" target="_blank" style="font-size:12px;">Live Demo</a>' : '') +
      '</div></div>' +
      '<div class="item-actions">' +
      '<button class="btn btn-sm btn-outline edit-project" data-id="' + pr.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger delete-project" data-id="' + pr.id + '">Delete</button>' +
      '</div></div>';
  }).join('');
}

function renderCerts() {
  var p = Profile.get();
  if (!p) return;
  var items = p.certifications || [];
  var list = $('certsList');
  var empty = $('certsEmpty');
  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = items.map(function(c){
    return '<div class="item-card">' +
      '<div class="item-info"><h4>' + esc(c.title) + '</h4>' +
      (c.organization ? '<p>' + esc(c.organization) + '</p>' : '') +
      (c.issueDate ? '<small>Issued: ' + c.issueDate + '</small>' : '') +
      (c.fileName ? '<div style="margin-top:4px;"><small>' + esc(c.fileName) + '</small></div>' : '') +
      '</div>' +
      '<div class="item-actions">' +
      '<button class="btn btn-sm btn-outline edit-cert" data-id="' + c.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger delete-cert" data-id="' + c.id + '">Delete</button>' +
      '</div></div>';
  }).join('');
}

function renderExp() {
  var p = Profile.get();
  if (!p) return;
  var items = p.experience || [];
  var list = $('expList');
  var empty = $('expEmpty');
  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = items.map(function(e){
    return '<div class="item-card">' +
      '<div class="item-info"><h4>' + esc(e.title) + '</h4>' +
      (e.organization ? '<p>' + esc(e.organization) + '</p>' : '') +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">' +
      (e.type ? '<span class="item-badge">' + esc(e.type) + '</span>' : '') +
      (e.startDate ? '<small>' + e.startDate + (e.current ? ' - Present' : e.endDate ? ' - ' + e.endDate : '') + '</small>' : '') +
      '</div>' +
      (e.description ? '<p style="margin-top:4px;font-size:13px;color:var(--text-muted);">' + esc(e.description) + '</p>' : '') +
      '</div>' +
      '<div class="item-actions">' +
      '<button class="btn btn-sm btn-outline edit-exp" data-id="' + e.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger delete-exp" data-id="' + e.id + '">Delete</button>' +
      '</div></div>';
  }).join('');
}

function renderAchievements() {
  var p = Profile.get();
  if (!p) return;
  var items = p.achievements || [];
  var list = $('achievementsList');
  var empty = $('achievementsEmpty');
  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = items.map(function(a){
    return '<div class="item-card">' +
      '<div class="item-info"><h4>' + esc(a.title) + '</h4>' +
      (a.date ? '<small>' + a.date + '</small>' : '') +
      (a.description ? '<p style="margin-top:4px;font-size:13px;color:var(--text-muted);">' + esc(a.description) + '</p>' : '') +
      '</div>' +
      '<div class="item-actions">' +
      '<button class="btn btn-sm btn-outline edit-ach" data-id="' + a.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger delete-ach" data-id="' + a.id + '">Delete</button>' +
      '</div></div>';
  }).join('');
}

function renderPrivacy() {
  var p = Profile.get();
  if (!p) return;
  var radios = document.querySelectorAll('input[name="privacy"]');
  var val = p.privacy || 'public';
  radios.forEach(function(r){ r.checked = r.value === val; });
}

/* ===== EVENT HANDLERS ===== */

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(function(item){
    item.addEventListener('click', function(e){
      e.preventDefault();
      var section = this.dataset.section;
      if (section) navigateTo(section);
    });
  });
}

function setupBasicInfo() {
  $('formBasicInfo').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get();
    if (!p) return;
    p.basicInfo = {
      fullName: $('basicName').value.trim(),
      email: $('basicEmail').value.trim(),
      university: $('basicUni').value.trim(),
      department: $('basicDept').value.trim(),
      semester: $('basicSem').value
    };
    Profile.save();
    renderHeader();
    renderCompletion();
    toast('Basic information saved!');
    addNotif('Basic Info Saved', 'Your basic information has been updated.', '&#128100;', 'general');
  });
}

function handlePhotoUpload(file, callback) {
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { toast('Please upload JPG, PNG, or WEBP.'); return; }
  var reader = new FileReader();
  reader.onload = function(ev){
    var p = Profile.get(); if (!p) return;
    p.profilePhoto = ev.target.result; Profile.save();
    renderPhoto(); renderHeader(); renderCompletion();
    addNotif('Photo Uploaded', 'Your profile photo has been updated.', '&#128247;', 'general');
    if (callback) callback();
  };
  reader.readAsDataURL(file);
}

function setupPhoto() {
  function triggerPhoto() { $('headerPhotoInput').click(); }
  $('btnUploadPhoto').addEventListener('click', triggerPhoto);
  $('headerPhotoInput').addEventListener('change', function(e){
    handlePhotoUpload(e.target.files[0]);
    this.value = '';
  });
  $('avatarWrapper').addEventListener('click', triggerPhoto);
  $('btnRemovePhoto').addEventListener('click', function(){
    var p = Profile.get(); if (!p) return;
    p.profilePhoto = null; Profile.save();
    renderPhoto(); renderHeader(); renderCompletion();
    toast('Photo removed.');
    addNotif('Photo Removed', 'Your profile photo has been removed.', '&#128465;', 'general');
  });
}

function handleCoverUpload(file, callback) {
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { toast('Please upload JPG, PNG, or WEBP.'); return; }
  var reader = new FileReader();
  reader.onload = function(ev){
    var p = Profile.get(); if (!p) return;
    p.coverPhoto = ev.target.result; Profile.save();
    renderCover(); renderHeader(); renderCompletion();
    addNotif('Cover Photo Updated', 'Your cover photo has been changed.', '&#127912;', 'general');
    if (callback) callback();
  };
  reader.readAsDataURL(file);
}

function setupCover() {
  function triggerCover() { $('headerCoverInput').click(); }
  $('btnUploadCover').addEventListener('click', triggerCover);
  $('headerCoverInput').addEventListener('change', function(e){
    handleCoverUpload(e.target.files[0]);
    this.value = '';
  });
  $('coverWrapper').addEventListener('click', triggerCover);
  $('btnRemoveCover').addEventListener('click', function(){
    var p = Profile.get(); if (!p) return;
    p.coverPhoto = null; Profile.save();
    renderCover(); renderHeader(); renderCompletion();
    toast('Cover removed.');
    addNotif('Cover Removed', 'Your cover photo has been removed.', '&#128465;', 'general');
  });
}

function setupBio() {
  $('formBio').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    p.bio = {
      bio: $('bioText').value.trim(),
      academicInterests: $('bioInterests').value.trim(),
      careerGoals: $('bioCareer').value.trim(),
      personalIntroduction: $('bioIntro').value.trim()
    };
    Profile.save();
    renderCompletion();
    toast('Bio saved!');
    addNotif('Bio Updated', 'Your bio and interests have been saved.', '&#128221;', 'general');
  });
}

function setupQualifications() {
  $('btnAddQual').addEventListener('click', function(){
    $('qualModalTitle').textContent = 'Add Qualification';
    $('qualEditId').value = '';
    $('formQual').reset();
    openModal('qualModal');
  });
  $('formQual').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var editId = $('qualEditId').value;
    var data = {
      type: $('qualType').value,
      name: $('qualName').value.trim(),
      department: $('qualDept').value.trim(),
      semester: $('qualSem').value,
      degree: $('qualDegree').value.trim(),
      graduation: $('qualGrad').value,
      location: $('qualLocation').value.trim()
    };
    if (!data.name) { toast('Institution name is required.'); return; }
    if (editId) {
      var idx = p.qualifications.findIndex(function(x){ return x.id === editId; });
      if (idx > -1) p.qualifications[idx] = Object.assign({}, p.qualifications[idx], data);
    } else {
      p.qualifications.push(Object.assign({ id: uid() }, data));
    }
    Profile.save(); renderQualifications(); renderHeader(); renderCompletion();
    closeModal('qualModal');
    toast(editId ? 'Qualification updated!' : 'Qualification added!');
    addNotif('Qualification ' + (editId ? 'Updated' : 'Added'), data.name + ' (' + data.degree + ')', '&#127891;', 'general');
  });
  $('qualsList').addEventListener('click', function(e){
    var edit = e.target.closest('.edit-qual');
    if (edit) {
      var id = edit.dataset.id;
      var p = Profile.get(); if (!p) return;
      var q = p.qualifications.find(function(x){ return x.id === id; });
      if (!q) return;
      $('qualModalTitle').textContent = 'Edit Qualification';
      $('qualEditId').value = id;
      $('qualType').value = q.type || 'University';
      $('qualName').value = q.name || '';
      $('qualDept').value = q.department || '';
      $('qualSem').value = q.semester || '';
      $('qualDegree').value = q.degree || '';
      $('qualGrad').value = q.graduation || '';
      $('qualLocation').value = q.location || '';
      openModal('qualModal');
      return;
    }
    var del = e.target.closest('.delete-qual');
    if (del) {
      if (!confirm('Delete this qualification?')) return;
      var id = del.dataset.id;
      var p = Profile.get(); if (!p) return;
      p.qualifications = p.qualifications.filter(function(x){ return x.id !== id; });
      Profile.save(); renderQualifications(); renderHeader(); renderCompletion();
      toast('Qualification deleted.');
      addNotif('Qualification Deleted', 'A qualification has been removed.', '&#128465;', 'general');
    }
  });
}

function setupSkills() {
  $('btnAddSkill').addEventListener('click', function(){
    var skill = prompt('Enter a skill:');
    if (skill && skill.trim()) {
      var p = Profile.get(); if (!p) return;
      p.skills.push(skill.trim()); Profile.save();
      renderSkills(); renderCompletion();
      addNotif('Skill Added', '"' + skill.trim() + '" added to your skills.', '&#127919;', 'general');
    }
  });
  $('skillsList').addEventListener('click', function(e){
    var r = e.target.closest('.skill-remove');
    if (r) {
      var idx = parseInt(r.dataset.index);
      var p = Profile.get(); if (!p) return;
      var removed = p.skills[idx];
      p.skills.splice(idx, 1); Profile.save();
      renderSkills(); renderCompletion();
      if (removed) addNotif('Skill Removed', '"' + removed + '" has been removed from your skills.', '&#128465;', 'general');
      return;
    }
    var n = e.target.closest('.skill-name');
    if (n) {
      var idx = parseInt(n.dataset.index);
      var p = Profile.get(); if (!p) return;
      var curr = p.skills[idx];
      var upd = prompt('Edit skill:', curr);
      if (upd && upd.trim() && upd.trim() !== curr) {
        p.skills[idx] = upd.trim(); Profile.save();
        renderSkills(); renderCompletion();
        addNotif('Skill Updated', '"' + curr + '" updated to "' + upd.trim() + '".', '&#128221;', 'general');
      }
    }
  });
}

function setupResume() {
  function clickResumeInput() { $('resumeInput').click(); }
  $('btnUploadResume').addEventListener('click', clickResumeInput);
  $('btnReplaceResume').addEventListener('click', clickResumeInput);
  $('resumeInput').addEventListener('change', function(e){
    var file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast('Please upload PDF or DOCX.'); return;
    }
    var reader = new FileReader();
    reader.onload = function(ev){
      var p = Profile.get(); if (!p) return;
      p.resume = { data: ev.target.result, name: file.name, type: file.type };
      Profile.save(); renderResume(); renderCompletion();
      toast('Resume uploaded!');
      addNotif('Resume Uploaded', 'Your resume has been uploaded successfully.', '&#128196;', 'general');
    };
    reader.readAsDataURL(file);
    this.value = '';
  });
  $('btnViewResume').addEventListener('click', function(){
    var p = Profile.get();
    if (!p || !p.resume || !p.resume.data) return;
    var win = window.open();
    if (p.resume.type === 'application/pdf') {
      win.document.write('<iframe src="' + p.resume.data + '" style="width:100%;height:100vh;border:none;"></iframe>');
    } else {
      win.document.write('<p>Cannot preview DOCX directly. <a href="' + p.resume.data + '" download="' + p.resume.name + '">Download file</a></p>');
    }
  });
  $('btnDeleteResume').addEventListener('click', function(){
    if (!confirm('Delete your resume?')) return;
    var p = Profile.get(); if (!p) return;
    p.resume = null; Profile.save();
    renderResume(); renderCompletion();
    toast('Resume deleted.');
    addNotif('Resume Deleted', 'Your resume has been removed.', '&#128465;', 'general');
  });
}

function setupSocial() {
  $('formSocial').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    p.socialLinks = {
      linkedin: $('socialLinkedin').value.trim(),
      github: $('socialGithub').value.trim(),
      portfolio: $('socialPortfolio').value.trim(),
      behance: $('socialBehance').value.trim(),
      dribbble: $('socialDribbble').value.trim()
    };
    Profile.save();
    renderCompletion();
    toast('Social links saved!');
    addNotif('Social Links Saved', 'Your social media links have been updated.', '&#128279;', 'general');
  });
}

/* ===== MODAL HELPERS ===== */
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

function setupModals() {
  document.querySelectorAll('.modal-close').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = this.dataset.modal;
      if (id) closeModal(id);
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(m){
    m.addEventListener('click', function(e){
      if (e.target === this) this.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-actions .btn-outline').forEach(function(btn){
    btn.addEventListener('click', function(){
      var modal = this.closest('.modal-overlay');
      if (modal) modal.classList.remove('open');
    });
  });
}

/* ===== PROJECTS CRUD ===== */
function setupProjects() {
  $('btnAddProject').addEventListener('click', function(){
    $('projectModalTitle').textContent = 'Add Project';
    $('projectEditId').value = '';
    $('formProject').reset();
    openModal('projectModal');
  });
  $('formProject').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var editId = $('projectEditId').value;
    var data = {
      name: $('projectName').value.trim(),
      description: $('projectDesc').value.trim(),
      technologies: $('projectTech').value.trim(),
      githubLink: $('projectGithub').value.trim(),
      demoLink: $('projectDemo').value.trim()
    };
    if (!data.name) { toast('Project name is required.'); return; }
    var fileInput = $('projectImage');
    var file = fileInput.files[0];
    function saveProj(img) {
      if (editId) {
        var idx = p.projects.findIndex(function(x){ return x.id === editId; });
        if (idx > -1) p.projects[idx] = Object.assign({}, p.projects[idx], data, { image: img || p.projects[idx].image });
      } else {
        p.projects.push(Object.assign({ id: uid() }, data, { image: img || null }));
      }
      Profile.save(); renderProjects(); renderCompletion();
      closeModal('projectModal');
      toast(editId ? 'Project updated!' : 'Project added!');
      addNotif('Project ' + (editId ? 'Updated' : 'Added'), data.name + ' has been ' + (editId ? 'updated' : 'added') + '.', '&#128187;', 'general');
    }
    if (file && ['image/jpeg','image/png','image/webp'].includes(file.type)) {
      var r = new FileReader();
      r.onload = function(ev){ saveProj(ev.target.result); };
      r.readAsDataURL(file);
    } else { saveProj(null); }
  });
  $('projectsList').addEventListener('click', function(e){
    var edit = e.target.closest('.edit-project');
    if (edit) {
      var id = edit.dataset.id;
      var p = Profile.get(); if (!p) return;
      var pr = p.projects.find(function(x){ return x.id === id; });
      if (!pr) return;
      $('projectModalTitle').textContent = 'Edit Project';
      $('projectEditId').value = id;
      $('projectName').value = pr.name || '';
      $('projectDesc').value = pr.description || '';
      $('projectTech').value = pr.technologies || '';
      $('projectGithub').value = pr.githubLink || '';
      $('projectDemo').value = pr.demoLink || '';
      $('projectImage').value = '';
      openModal('projectModal');
      return;
    }
    var del = e.target.closest('.delete-project');
    if (del) {
      if (!confirm('Delete this project?')) return;
      var id = del.dataset.id;
      var p = Profile.get(); if (!p) return;
      p.projects = p.projects.filter(function(x){ return x.id !== id; });
      Profile.save(); renderProjects(); renderCompletion();
      toast('Project deleted.');
      addNotif('Project Deleted', 'A project has been removed.', '&#128465;', 'general');
    }
  });
}

/* ===== CERTIFICATIONS CRUD ===== */
function setupCerts() {
  $('btnAddCert').addEventListener('click', function(){
    $('certModalTitle').textContent = 'Add Certification';
    $('certEditId').value = '';
    $('formCert').reset();
    openModal('certModal');
  });
  $('formCert').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var editId = $('certEditId').value;
    var data = { title: $('certTitle').value.trim(), organization: $('certOrg').value.trim(), issueDate: $('certDate').value };
    if (!data.title) { toast('Certificate title is required.'); return; }
    var fileInput = $('certFile');
    var file = fileInput.files[0];
    function saveCert(fd) {
      if (editId) {
        var idx = p.certifications.findIndex(function(x){ return x.id === editId; });
        if (idx > -1) {
          p.certifications[idx] = Object.assign({}, p.certifications[idx], data);
          if (fd) { p.certifications[idx].file = fd; p.certifications[idx].fileName = file.name; p.certifications[idx].fileType = file.type; }
        }
      } else {
        p.certifications.push(Object.assign({ id: uid() }, data, { file: fd || null, fileName: file ? file.name : '', fileType: file ? file.type : '' }));
      }
      Profile.save(); renderCerts(); renderCompletion();
      closeModal('certModal');
      toast(editId ? 'Certification updated!' : 'Certification added!');
      addNotif('Certification ' + (editId ? 'Updated' : 'Added'), data.title + ' has been ' + (editId ? 'updated' : 'added') + '.', '&#127942;', 'general');
    }
    if (file) { var r = new FileReader(); r.onload = function(ev){ saveCert(ev.target.result); }; r.readAsDataURL(file); }
    else { saveCert(null); }
  });
  $('certsList').addEventListener('click', function(e){
    var edit = e.target.closest('.edit-cert');
    if (edit) {
      var id = edit.dataset.id;
      var p = Profile.get(); if (!p) return;
      var c = p.certifications.find(function(x){ return x.id === id; });
      if (!c) return;
      $('certModalTitle').textContent = 'Edit Certification';
      $('certEditId').value = id;
      $('certTitle').value = c.title || '';
      $('certOrg').value = c.organization || '';
      $('certDate').value = c.issueDate || '';
      $('certFile').value = '';
      openModal('certModal');
      return;
    }
    var del = e.target.closest('.delete-cert');
    if (del) {
      if (!confirm('Delete this certification?')) return;
      var id = del.dataset.id;
      var p = Profile.get(); if (!p) return;
      p.certifications = p.certifications.filter(function(x){ return x.id !== id; });
      Profile.save(); renderCerts(); renderCompletion();
      toast('Certification deleted.');
      addNotif('Certification Deleted', 'A certification has been removed.', '&#128465;', 'general');
    }
  });
}

/* ===== EXPERIENCE CRUD ===== */
function setupExp() {
  $('btnAddExp').addEventListener('click', function(){
    $('expModalTitle').textContent = 'Add Experience';
    $('expEditId').value = '';
    $('formExp').reset();
    $('expEnd').disabled = false;
    openModal('expModal');
  });
  $('formExp').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var editId = $('expEditId').value;
    var data = {
      title: $('expTitle').value.trim(),
      organization: $('expOrg').value.trim(),
      type: $('expType').value,
      startDate: $('expStart').value,
      endDate: $('expCurrent').checked ? '' : $('expEnd').value,
      current: $('expCurrent').checked,
      description: $('expDesc').value.trim()
    };
    if (!data.title) { toast('Title is required.'); return; }
    if (editId) {
      var idx = p.experience.findIndex(function(x){ return x.id === editId; });
      if (idx > -1) p.experience[idx] = Object.assign({}, p.experience[idx], data);
    } else {
      p.experience.push(Object.assign({ id: uid() }, data));
    }
    Profile.save(); renderExp(); renderCompletion();
    closeModal('expModal');
    toast(editId ? 'Experience updated!' : 'Experience added!');
    addNotif('Experience ' + (editId ? 'Updated' : 'Added'), data.title + ' at ' + data.organization, '&#128188;', 'general');
  });
  $('expCurrent').addEventListener('change', function(){
    $('expEnd').disabled = this.checked;
    if (this.checked) $('expEnd').value = '';
  });
  $('expList').addEventListener('click', function(e){
    var edit = e.target.closest('.edit-exp');
    if (edit) {
      var id = edit.dataset.id;
      var p = Profile.get(); if (!p) return;
      var ex = p.experience.find(function(x){ return x.id === id; });
      if (!ex) return;
      $('expModalTitle').textContent = 'Edit Experience';
      $('expEditId').value = id;
      $('expTitle').value = ex.title || '';
      $('expOrg').value = ex.organization || '';
      $('expType').value = ex.type || 'internship';
      $('expStart').value = ex.startDate || '';
      $('expEnd').value = ex.endDate || '';
      $('expCurrent').checked = ex.current || false;
      $('expEnd').disabled = ex.current || false;
      $('expDesc').value = ex.description || '';
      openModal('expModal');
      return;
    }
    var del = e.target.closest('.delete-exp');
    if (del) {
      if (!confirm('Delete this experience?')) return;
      var id = del.dataset.id;
      var p = Profile.get(); if (!p) return;
      p.experience = p.experience.filter(function(x){ return x.id !== id; });
      Profile.save(); renderExp(); renderCompletion();
      toast('Experience deleted.');
      addNotif('Experience Deleted', 'An experience entry has been removed.', '&#128465;', 'general');
    }
  });
}

/* ===== ACHIEVEMENTS CRUD ===== */
function setupAchievements() {
  $('btnAddAchievement').addEventListener('click', function(){
    $('achModalTitle').textContent = 'Add Achievement';
    $('achEditId').value = '';
    $('formAchievement').reset();
    openModal('achievementModal');
  });
  $('formAchievement').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var editId = $('achEditId').value;
    var data = { title: $('achTitle').value.trim(), description: $('achDesc').value.trim(), date: $('achDate').value };
    if (!data.title) { toast('Title is required.'); return; }
    if (editId) {
      var idx = p.achievements.findIndex(function(x){ return x.id === editId; });
      if (idx > -1) p.achievements[idx] = Object.assign({}, p.achievements[idx], data);
    } else {
      p.achievements.push(Object.assign({ id: uid() }, data));
    }
    Profile.save(); renderAchievements(); renderCompletion();
    closeModal('achievementModal');
    toast(editId ? 'Achievement updated!' : 'Achievement added!');
    addNotif('Achievement ' + (editId ? 'Updated' : 'Added'), data.title, '&#127942;', 'general');
  });
  $('achievementsList').addEventListener('click', function(e){
    var edit = e.target.closest('.edit-ach');
    if (edit) {
      var id = edit.dataset.id;
      var p = Profile.get(); if (!p) return;
      var a = p.achievements.find(function(x){ return x.id === id; });
      if (!a) return;
      $('achModalTitle').textContent = 'Edit Achievement';
      $('achEditId').value = id;
      $('achTitle').value = a.title || '';
      $('achDesc').value = a.description || '';
      $('achDate').value = a.date || '';
      openModal('achievementModal');
      return;
    }
    var del = e.target.closest('.delete-ach');
    if (del) {
      if (!confirm('Delete this achievement?')) return;
      var id = del.dataset.id;
      var p = Profile.get(); if (!p) return;
      p.achievements = p.achievements.filter(function(x){ return x.id !== id; });
      Profile.save(); renderAchievements(); renderCompletion();
      toast('Achievement deleted.');
      addNotif('Achievement Deleted', 'An achievement has been removed.', '&#128465;', 'general');
    }
  });
}

/* ===== PRIVACY ===== */
function setupPrivacy() {
  $('formPrivacy').addEventListener('submit', function(e){
    e.preventDefault();
    var p = Profile.get(); if (!p) return;
    var sel = document.querySelector('input[name="privacy"]:checked');
    if (sel) p.privacy = sel.value;
    Profile.save();
    toast('Privacy settings saved!');
    addNotif('Privacy Updated', 'Your privacy settings have been saved.', '&#128274;', 'general');
  });
}

/* ===== ADD FIRST BUTTONS ===== */
function setupAddFirst() {
  document.querySelectorAll('.btn-add-first').forEach(function(btn){
    btn.addEventListener('click', function(){
      var section = this.dataset.section;
      if (section === 'qualifications') $('btnAddQual').click();
      else if (section === 'skills') $('btnAddSkill').click();
      else if (section === 'certifications') $('btnAddCert').click();
      else if (section === 'experience') $('btnAddExp').click();
      else if (section === 'achievements') $('btnAddAchievement').click();
    });
  });
}

/* ===== INIT ===== */
function init() {
  var user = Store.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  Profile.get();
  navigateTo('overview');
  setupNavigation();
  setupBasicInfo();
  setupPhoto();
  setupCover();
  setupBio();
  setupQualifications();
  setupSkills();
  setupResume();
  setupSocial();
  setupProjects();
  setupCerts();
  setupExp();
  setupAchievements();
  setupPrivacy();
  setupModals();
  setupAddFirst();
}

document.addEventListener('DOMContentLoaded', init);

})();
