const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const postsPath = path.join(__dirname, 'data', 'posts.json');
let posts = require(postsPath);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
const sessions = {};
const passwordHint = ADMIN_PASSWORD
  ? 'Enter the admin password you set in ADMIN_PASSWORD.'
  : 'No password is required. Just sign in.';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: false }));

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
}

function slugify(text) {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  let slug = base || `post-${Date.now()}`;
  let suffix = 1;
  while (posts.some((post) => post.id === slug)) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPostContent(content) {
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  return escapeHtml(content).replace(/\r?\n/g, '<br>');
}

function savePosts() {
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
}

function requireAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.blog_session;
  if (sessionId && sessions[sessionId]) {
    return next();
  }

  res.redirect('/login');
}

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    return res.status(404).render('404', { message: 'Post not found' });
  }
  post.contentHtml = renderPostContent(post.content);
  res.render('post', { post });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null, passwordHint });
});

app.post('/login', (req, res) => {
  const password = req.body.password || '';
  if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
    return res.status(401).render('login', { error: 'Incorrect password', passwordHint });
  }

  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions[sessionId] = { createdAt: Date.now() };
  res.setHeader('Set-Cookie', `blog_session=${sessionId}; HttpOnly; Path=/; SameSite=Strict`);
  res.redirect('/admin');
});

app.get('/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.blog_session;
  if (sessionId) {
    delete sessions[sessionId];
  }
  res.setHeader('Set-Cookie', 'blog_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  res.redirect('/');
});

app.get('/admin', requireAuth, (req, res) => {
  res.render('admin', { posts });
});

app.post('/admin', requireAuth, (req, res) => {
  const { title, excerpt, content } = req.body;
  if (!title || !content) {
    return res.status(400).render('404', { message: 'Title and content are required.' });
  }

  const newPost = {
    id: slugify(title),
    title: title.trim(),
    publishDate: new Date().toISOString().split('T')[0],
    excerpt: excerpt.trim() || content.trim().slice(0, 120) + '...',
    content: content.trim(),
    readingTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 180))} min`
  };

  posts.unshift(newPost);
  savePosts();
  res.redirect(`/post/${newPost.id}`);
});

app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Blog server running: http://localhost:${PORT}`);
});
