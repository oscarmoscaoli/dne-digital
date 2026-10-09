'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const form = $('profile-form'), access = $('access-form');
  const screens = ['access-screen', 'edit-screen', 'card-screen'];
  let profile = null, db = null, persistent = false, photo = '', photoBusy = false;
  let fromScreen = 'access-screen', currentScreen = 'access-screen', installPrompt = null;
  let toastTimer, dialogAction = null, photoGeneration = 0;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  $('access-birth').max = today; $('profile-birth').max = today;
  const normalize = value => String(value || '').replace(/[\s.\-]/g,'').toUpperCase();
  const cpfFormat = value => {
    const digits = String(value || '').replace(/\D/g,'').slice(0,11);
    return digits.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  };
  const dateFormat = value => value ? value.split('-').reverse().join('/') : 'Não informado';
  const expiryFormat = value => {
    if (!value) return 'Não informada';
    const [year,month] = value.split('-').map(Number);
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${months[month-1]}/${year}`;
  };
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 5000); }
  function error(id,message) { $(id).textContent = message; $(id).hidden = !message; }
  function show(id) {
    for (const screen of screens) $(screen).hidden = screen !== id;
    currentScreen = id; window.scrollTo(0,0);
    const heading = $(id).querySelector('h1');
    if (id !== 'access-screen') heading.focus({preventScroll:true});
    document.title = id === 'card-screen' ? 'Minha carteirinha • Dne Digital' : 'Dne Digital';
  }
  function dialog(title,text,action) {
    $('dialog-title').textContent = title; $('dialog-text').textContent = text;
    $('info-dialog').setAttribute('aria-labelledby','dialog-title');
    $('info-dialog').setAttribute('aria-describedby','dialog-text');
    $('dialog-cancel').hidden = !action; $('dialog-confirm').textContent = action ? 'Apagar dados' : 'Entendi';
    dialogAction = action || null; $('info-dialog').showModal();
  }
  $('dialog-cancel').addEventListener('click',() => $('info-dialog').close());
  $('dialog-confirm').addEventListener('click',async () => { const action = dialogAction; $('info-dialog').close(); if (action) await action(); });
  $('info-dialog').addEventListener('close',() => dialogAction = null);

  // IndexedDB stores the current profile and compressed photograph locally.
  function openDatabase() {
    return new Promise((resolve,reject) => {
      const request = indexedDB.open('dne-digital:' + new URL('./', document.baseURI).pathname,1);
      request.onupgradeneeded = () => request.result.createObjectStore('profiles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Storage blocked'));
    });
  }
  function readProfile() {
    return new Promise((resolve,reject) => {
      const transaction = db.transaction('profiles','readonly');
      const request = transaction.objectStore('profiles').get('current');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  function writeProfile(value) {
    if (!persistent) return Promise.resolve();
    return new Promise((resolve,reject) => {
      const transaction = db.transaction('profiles','readwrite');
      const store = transaction.objectStore('profiles');
      if (value) store.put(value,'current'); else store.delete('current');
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Storage transaction aborted'));
    });
  }
  const initialized = (async () => {
    try {
      db = await openDatabase(); profile = await readProfile(); persistent = true;
      db.onversionchange = () => { db.close(); persistent = false; toast('O armazenamento foi alterado. Reabra o app para continuar salvando.'); };
    } catch {
      toast('Armazenamento indisponível. Os dados ficarão apenas nesta sessão.');
    }
  })();

  function setPhotoPreview() {
    const container = $('photo-preview'); container.replaceChildren();
    if (photo) { const img = document.createElement('img'); img.src = photo; img.alt = 'Foto escolhida'; container.append(img); }
    else { const span = document.createElement('span'); span.textContent = 'Sem foto'; span.className = 'muted small'; container.append(span); }
    $('remove-photo').hidden = !photo;
  }
  function openEditor(values = null) {
    fromScreen = currentScreen === 'card-screen' ? 'card-screen' : 'access-screen';
    form.reset(); error('profile-error','');
    for (const name of ['name','cpf','birth','rg','code','institution','course','level','expiry']) form.elements.namedItem(name).value = values?.[name] || '';
    photo = values?.photo || ''; photoGeneration++; photoBusy = false; $('save-button').disabled = false;
    setPhotoPreview(); show('edit-screen');
  }
  function renderCard() {
    if (!profile) return;
    for (const key of ['name','institution','course','level','code']) $('card-'+key).textContent = profile[key] || 'Não informado';
    $('card-cpf').textContent = profile.cpf || 'Não informado';
    $('card-rg').textContent = profile.rg || 'Não informado';
    $('card-birth').textContent = dateFormat(profile.birth); $('card-expiry').textContent = expiryFormat(profile.expiry);
    const portrait = $('card-photo-wrap'); portrait.replaceChildren();
    if (profile.photo) { const img = document.createElement('img'); img.src = profile.photo; img.alt = `Foto de ${profile.name}`; portrait.append(img); }
    else {
      const div = document.createElement('div'); div.className = 'initials';
      const strong = document.createElement('strong'); strong.textContent = profile.name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase();
      const span = document.createElement('span'); span.className = 'sr-only'; span.textContent = 'Foto não adicionada'; div.append(strong,span); portrait.append(div);
    }
    $('qr-image').replaceChildren(window.DneQR.svg(`DNE DIGITAL - DEMONSTRACAO\nID:${profile.demoId}`));
  }
  function updateAccessButton() {
    $('enter-button').disabled = !access.checkValidity() || !$('access-id').value.trim();
    $('access-birth').parentElement.classList.toggle('has-value',Boolean($('access-birth').value));
    error('access-error','');
  }
  access.addEventListener('input',updateAccessButton);
  access.addEventListener('submit',async event => {
    event.preventDefault(); await initialized;
    const identifier = $('access-id').value.trim(), birth = $('access-birth').value;
    if (!access.reportValidity() || !identifier) return;
    if (profile) {
      if ((normalize(identifier) === normalize(profile.cpf) || normalize(identifier) === normalize(profile.code)) && birth === profile.birth) {
        renderCard(); show('card-screen');
      } else error('access-error','Os dados não correspondem à carteirinha salva. Role até o fim da tela e use “Configurar carteirinha” para editar.');
    } else {
      const digits = identifier.replace(/\D/g,'');
      openEditor({birth, cpf:/^[\d.\-\s]+$/.test(identifier) && digits.length === 11 ? cpfFormat(digits) : '',code:digits.length === 11 && /^[\d.\-\s]+$/.test(identifier) ? '' : identifier});
      toast('Complete os dados para visualizar sua carteirinha.');
    }
  });
  $('create-button').addEventListener('click',async () => {
    await initialized;
    openEditor(profile || {birth:$('access-birth').value});
  });
  $('profile-cpf').addEventListener('input',event => event.target.value = cpfFormat(event.target.value));
  $('photo-input').addEventListener('change',async event => {
    const file = event.target.files[0]; if (!file) return;
    const generation = ++photoGeneration;
    error('profile-error','');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { error('profile-error','Escolha uma imagem JPG, PNG ou WebP.'); event.target.value = ''; return; }
    if (file.size > 8*1024*1024) { error('profile-error','A foto deve ter até 8 MB.'); event.target.value = ''; return; }
    photoBusy = true; $('save-button').disabled = true;
    try {
      const blobURL = URL.createObjectURL(file);
      try {
        const img = new Image(); img.src = blobURL; await img.decode();
        const scale = Math.min(1,800/Math.max(img.width,img.height));
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(img.width*scale)); canvas.height = Math.max(1,Math.round(img.height*scale));
        const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(img,0,0,canvas.width,canvas.height);
        if (generation === photoGeneration) { photo = canvas.toDataURL('image/jpeg',.82); setPhotoPreview(); }
      } finally { URL.revokeObjectURL(blobURL); }
    } catch { if (generation === photoGeneration) error('profile-error','Não foi possível ler a imagem. Tente outra foto.'); }
    finally { if (generation === photoGeneration) { photoBusy = false; $('save-button').disabled = false; event.target.value = ''; } }
  });
  $('remove-photo').addEventListener('click',() => { photoGeneration++; photo = ''; photoBusy = false; $('save-button').disabled = false; $('photo-input').value = ''; setPhotoPreview(); });
  form.addEventListener('submit',async event => {
    event.preventDefault(); await initialized; error('profile-error','');
    if (photoBusy) return;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    for (const key of Object.keys(data)) data[key] = String(data[key]).trim();
    if (!data.name || !data.institution || !data.course) { error('profile-error','Preencha nome, instituição e curso.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birth) || !Number.isFinite(Date.parse(data.birth)) || data.birth > today) { error('profile-error','Informe uma data de nascimento válida.'); return; }
    if (data.expiry && !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.expiry)) { error('profile-error','Informe a validade no formato mês/ano.'); return; }
    const demoId = profile?.demoId || (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g,'').slice(0,12).toUpperCase();
    const next = {...data, code:data.code || `DEMO-${demoId.slice(0,8)}`, demoId, photo, version:1};
    $('save-button').disabled = true;
    try {
      await writeProfile(next); profile = next;
      renderCard(); show('card-screen');
      toast(persistent ? 'Dados salvos neste dispositivo.' : 'Prévia criada para esta sessão.');
    } catch { error('profile-error','Não foi possível salvar. Verifique o espaço disponível ou tente novamente.'); }
    finally { $('save-button').disabled = false; }
  });
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Neste navegador, instale o app na tela inicial para abrir sem a barra de endereço.');
    } catch { toast('O navegador não permitiu tela cheia. Você pode instalar o app na tela inicial.'); }
  }
  async function install() {
    if (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone) { toast('Você já está usando o app instalado.'); return; }
    if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; return; }
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    dialog('Instalar Dne Digital',isApple ? 'No Safari, abra o menu Compartilhar e escolha “Adicionar à Tela de Início”. Depois abra o Dne Digital pelo ícone criado.' : 'No menu do navegador, procure “Instalar aplicativo” ou “Adicionar à tela inicial”. No computador, use o ícone de instalação na barra de endereço, quando disponível.');
  }
  document.addEventListener('click',async event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    switch(action) {
      case 'back': photoGeneration++; photoBusy = false; show(fromScreen); break;
      case 'edit': await initialized; openEditor(profile); break;
      case 'logout': access.reset(); updateAccessButton(); show('access-screen'); break;
      case 'fullscreen': await fullscreen(); break;
      case 'install': await install(); break;
      case 'unlock': dialog('Desbloquear DNE físico','O desbloqueio de um documento físico depende do serviço do emissor. Esta versão reproduz a interface e não está conectada a esse serviço.'); break;
      case 'wallet': dialog('Adicionar à Carteira da Apple','Para adicionar à Carteira da Apple, é necessário um passe assinado fornecido pelo emissor. Esta versão ainda não está integrada à emissão de passes.'); break;
      case 'about': dialog('Sobre o Dne Digital','Protótipo visual baseado nas referências fornecidas. Você preenche os dados e visualiza uma carteirinha de demonstração.\n\nOs dados e a foto ficam apenas neste navegador. O acesso por CPF/código e nascimento localiza a prévia local; não é autenticação segura. O QR contém somente um identificador de demonstração.\n\nEmissão, validação oficial e Apple Wallet exigem serviços do emissor.'); break;
      case 'delete': dialog('Apagar dados deste dispositivo?','A foto e os dados da prévia serão removidos deste navegador. Esta ação não pode ser desfeita.',async () => {
        try {
          await writeProfile(null); profile = null; photo = ''; photoGeneration++; photoBusy = false; form.reset(); access.reset();
          for (const key of ['name','institution','course','level','code','cpf','rg','birth','expiry']) $('card-'+key).textContent = '';
          $('card-photo-wrap').replaceChildren(); $('qr-image').replaceChildren(); setPhotoPreview(); updateAccessButton(); show('access-screen'); toast('Dados apagados.');
        } catch { toast('Não foi possível apagar os dados. Tente novamente.'); }
      }); break;
    }
  });
  window.addEventListener('beforeinstallprompt',event => { event.preventDefault(); installPrompt = event; });
  window.addEventListener('appinstalled',() => { installPrompt = null; toast('Dne Digital instalado.'); });
  if ('serviceWorker' in navigator && ['http:','https:'].includes(location.protocol)) {
    window.addEventListener('load',() => navigator.serviceWorker.register('./service-worker.js').catch(() => {
      toast('Modo offline indisponível. O app continua funcionando online.');
    }));
  }
})();
