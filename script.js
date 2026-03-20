// =====================================
// データ管理（localStorageに保存）
// =====================================

// スレッド一覧をlocalStorageから読み込む
function loadThreads() {
  const data = localStorage.getItem('bbs_threads');
  return data ? JSON.parse(data) : [];
}

// スレッド一覧をlocalStorageに保存する
function saveThreads(threads) {
  localStorage.setItem('bbs_threads', JSON.stringify(threads));
}

// =====================================
// スレッド作成
// =====================================

function createThread() {
  const title = document.getElementById('thread-title').value.trim();
  const body  = document.getElementById('thread-body').value.trim();
  const name  = document.getElementById('thread-name').value.trim() || '名無し';

  // タイトルが空だったら止める
  if (!title) {
    alert('タイトルを入力してください');
    return;
  }

  const threads = loadThreads();

  // 新しいスレッドオブジェクトを作る
  const newThread = {
    id: Date.now(),          // IDは現在時刻（ユニークになる）
    title: title,
    createdAt: new Date().toLocaleString('ja-JP'),
    posts: []                // 返信の配列（最初は空）
  };

  // 最初のメッセージがあれば追加する
  if (body) {
    newThread.posts.push({
      name: name,
      body: body,
      createdAt: new Date().toLocaleString('ja-JP')
    });
  }

  threads.unshift(newThread); // 先頭に追加
  saveThreads(threads);

  // フォームをリセット
  document.getElementById('thread-title').value = '';
  document.getElementById('thread-body').value = '';
  document.getElementById('thread-name').value = '';

  renderThreads(); // 画面を更新
}

// =====================================
// スレッド一覧の表示
// =====================================

function renderThreads() {
  const threads = loadThreads();
  const container = document.getElementById('threads');

  if (threads.length === 0) {
    container.innerHTML = '<p class="empty">まだスレッドがありません。最初のスレッドを立ててみよう！</p>';
    return;
  }

  container.innerHTML = threads.map(thread => `
    <div class="thread-card" onclick="openThread(${thread.id})">
      <div class="thread-card-title">${escapeHtml(thread.title)}</div>
      <div class="thread-card-meta">作成: ${thread.createdAt}</div>
      ${thread.posts.length > 0
        ? `<div class="thread-card-preview">${escapeHtml(thread.posts[0].body)}</div>`
        : ''}
      <span class="thread-count">${thread.posts.length} 件の返信</span>
    </div>
  `).join('');
}

// =====================================
// モーダル（スレッドを開く）
// =====================================

let currentThreadId = null; // 今開いているスレッドのID

function openThread(id) {
  currentThreadId = id;
  const threads = loadThreads();
  const thread = threads.find(t => t.id === id);
  if (!thread) return;

  document.getElementById('modal-title').textContent = thread.title;
  renderPosts(thread.posts);

  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
  currentThreadId = null;
}

// 投稿一覧を表示する
function renderPosts(posts) {
  const container = document.getElementById('modal-posts');

  if (posts.length === 0) {
    container.innerHTML = '<p class="empty">まだ返信がありません</p>';
    return;
  }

  container.innerHTML = posts.map((post, index) => `
    <div class="post">
      <div class="post-meta">
        <span class="post-name">${escapeHtml(post.name)}</span>
        &nbsp;|&nbsp; ${index + 1}番目 &nbsp;|&nbsp; ${post.createdAt}
      </div>
      <div class="post-body">${escapeHtml(post.body)}</div>
    </div>
  `).join('');

  // 一番下にスクロール
  container.scrollTop = container.scrollHeight;
}

// =====================================
// 返信する
// =====================================

function submitReply() {
  const name = document.getElementById('reply-name').value.trim() || '名無し';
  const body = document.getElementById('reply-body').value.trim();

  if (!body) {
    alert('返信内容を入力してください');
    return;
  }

  const threads = loadThreads();
  const thread = threads.find(t => t.id === currentThreadId);
  if (!thread) return;

  // 返信を追加
  thread.posts.push({
    name: name,
    body: body,
    createdAt: new Date().toLocaleString('ja-JP')
  });

  saveThreads(threads);

  // フォームをリセット
  document.getElementById('reply-body').value = '';

  renderPosts(thread.posts); // 投稿一覧を更新
  renderThreads();           // スレッド一覧も更新
}

// =====================================
// XSS対策（HTMLのエスケープ）
// =====================================

// 悪意のあるスクリプトが実行されないよう、特殊文字を無害化する
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =====================================
// 初期化（ページ読み込み時に実行）
// =====================================
renderThreads();
