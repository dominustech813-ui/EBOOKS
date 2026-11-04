/* One client and one set of handlers, independent of catalog initialization. */
window.HEBOOKS_AUTH = (() => {
  const byId = id => document.getElementById(id);
  const config = window.HEBOOKS_CONFIG || {};
  let client, busy = false;
  let recovering = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
  function notify(message, error = false) {
    const el = byId('gate-message');
    el.textContent = message;
    el.classList.toggle('error', error);
    el.style.display = message ? 'block' : 'none';
    el.style.color = error ? '#b42318' : '#175c39';
  }
  function show(mode) {
    if (recovering) return;
    const login = mode === 'login';
    byId('gate-login-form').classList.toggle('hidden', !login);
    byId('gate-register-form').classList.toggle('hidden', login);
    byId('gate-tab-login').classList.toggle('active', login);
    byId('gate-tab-register').classList.toggle('active', !login);
    byId('gate-title').textContent = login ? 'Entre na sua conta' : 'Crie sua conta';
    byId('gate-subtitle').textContent = login ? 'Use o mesmo e-mail e senha da sua conta antiga.' : 'Crie sua conta para acessar o catálogo.';
    notify('');
  }
  function showRecovery() {
    recovering = true;
    document.body.classList.add('auth-locked');
    ['gate-tabs','gate-register-form','gate-login-form','gate-password-reset','gate-github-button','gate-github-note'].forEach(id => byId(id).classList.add('hidden'));
    byId('gate-update-form').classList.remove('hidden');
    byId('gate-title').textContent = 'Defina sua nova senha';
    byId('gate-subtitle').textContent = 'Digite e confirme uma senha com pelo menos 8 caracteres.';
  }
  function getClient() {
    if (!client) {
      if (!window.supabase?.createClient || !config.supabaseUrl || !config.supabasePublishableKey) {
        throw new Error('Não foi possível carregar o acesso. Recarregue a página e tente novamente.');
      }
      client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        global: { fetch: (url, options = {}) => fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(20000) }) }
      });
      client.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') showRecovery();
      });
    }
    return client;
  }
  function errorMessage(error) {
    if (error?.code === 'invalid_credentials') return 'E-mail ou senha incorretos. Confira os dados ou use Esqueci minha senha.';
    if (error?.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
    if (error?.status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    if (['AbortError','TimeoutError','TypeError'].includes(error?.name)) return 'A conexão não respondeu. Verifique sua internet e tente novamente.';
    return error?.message || 'Não foi possível concluir. Tente novamente.';
  }
  async function run(button, message, action) {
    if (busy) return;
    busy = true;
    button.disabled = true;
    notify(message);
    try { await action(); } catch (error) { notify(errorMessage(error), true); }
    finally { busy = false; button.disabled = false; }
  }
  function emailFor(mode) {
    const email = byId(`gate-${mode}-email`).value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
    return email;
  }
  async function submit(event, mode) {
    event.preventDefault();
    await run(byId(`gate-${mode}-button`), mode === 'login' ? 'Entrando na conta...' : 'Criando sua conta...', async () => {
      const email = emailFor(mode), password = byId(`gate-${mode}-password`).value;
      if (!password) throw new Error('Informe sua senha.');
      if (mode === 'register') {
        if (password.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
        const response = await fetch(config.accountApiUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', email, password }), signal: AbortSignal.timeout(20000)
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          show('login'); byId('gate-login-email').value = email;
          throw new Error('Esta conta já existe. Use Entrar ou Esqueci minha senha.');
        }
        if (!response.ok) throw new Error(data.error || 'Não foi possível criar a conta.');
      }
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data?.session) throw new Error('Não foi possível iniciar a sessão. Tente entrar novamente.');
      notify('Login realizado! Abrindo seu catálogo...');
      window.location.reload();
    });
  }
  async function recover(event) {
    event.preventDefault();
    await run(byId('gate-password-reset'), 'Solicitando recuperação...', async () => {
      const mode = byId('gate-login-form').classList.contains('hidden') ? 'register' : 'login';
      const email = emailFor(mode);
      const { error } = await getClient().auth.resetPasswordForEmail(email, { redirectTo: 'https://lojahebooks.com.br/' });
      if (error) {
        if (error.status >= 500) throw new Error('O serviço de e-mail não conseguiu enviar a recuperação. Entre em contato com o suporte da loja.');
        throw error;
      }
      notify('Solicitação processada. Se o e-mail estiver cadastrado, confira sua caixa de entrada e spam.');
    });
  }
  async function updatePassword(event) {
    event.preventDefault();
    await run(byId('gate-update-button'), 'Salvando nova senha...', async () => {
      if (!recovering) throw new Error('Solicite um novo link de recuperação.');
      const password = byId('gate-new-password').value;
      if (password.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
      if (password !== byId('gate-confirm-password').value) throw new Error('As senhas não coincidem.');
      const { error } = await getClient().auth.updateUser({ password });
      if (error) throw error;
      byId('gate-new-password').value = ''; byId('gate-confirm-password').value = '';
      notify('Senha atualizada. Abrindo sua conta...');
      window.location.replace(window.location.pathname + window.location.search);
    });
  }
  byId('gate-tab-login').addEventListener('click', () => show('login'));
  byId('gate-tab-register').addEventListener('click', () => show('register'));
  byId('gate-login-form').addEventListener('submit', event => submit(event, 'login'));
  byId('gate-register-form').addEventListener('submit', event => submit(event, 'register'));
  byId('gate-password-reset').addEventListener('click', recover);
  byId('gate-update-form').addEventListener('submit', updatePassword);
  show('login');
  const ready = (async () => {
    try {
      if (recovering) showRecovery();
      const { error } = await getClient().auth.getSession();
      if (error) throw error;
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.has('error')) notify('Link de acesso inválido ou expirado. Solicite uma nova recuperação.', true);
    } catch (error) { notify(errorMessage(error), true); }
  })();
  return { getClient, show, submit, recover, notify, ready, isRecovering: () => recovering };
})();
