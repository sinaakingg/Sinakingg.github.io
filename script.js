// ======= تنظیم رمز مدیر =======
const PASSWORD = "1234";

// ======= ورود مدیر =======
function login(){
  if(document.getElementById('pass').value === PASSWORD){
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('panel').classList.remove('hidden');
  } else alert('رمز اشتباه است');
}

// ======= Firebase Config =======
// جایگزین کنید با اطلاعات پروژه خودتان
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// ======= اتصال به Firebase =======
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const postsRef = db.ref('posts');

// ======= افزودن پست جدید =======
function addPost(){
  const file = document.getElementById('file').files[0];
  const caption = document.getElementById('caption').value;
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const newPost = {
      image: reader.result,
      caption: caption,
      timestamp: Date.now(),
      likes: 0,
      comments: []
    };
    postsRef.push(newPost);
    document.getElementById('file').value = '';
    document.getElementById('caption').value = '';
  };
  reader.readAsDataURL(file);
}

// ======= نمایش پست‌ها =======
postsRef.on('value', snapshot => {
  const box = document.getElementById('posts');
  box.innerHTML = '';
  const data = snapshot.val();
  if(!data) return;

  Object.keys(data).reverse().forEach(key => {
    const post = data[key];
    const d = document.createElement('div');
    d.className = 'post';
    d.innerHTML = `
      <img src="${post.image}" />
      <div class="caption">${post.caption}</div>
      <div>
        <button onclick="likePost('${key}')">❤️ ${post.likes}</button>
      </div>
      <div>
        <input type="text" placeholder="کامنت..." id="c-${key}" />
        <button onclick="addComment('${key}')">ارسال</button>
      </div>
      <div class="comments">
        ${post.comments.map(c => `<div>${c}</div>`).join('')}
      </div>
    `;
    box.appendChild(d);
  });
});

// ======= لایک کردن پست =======
function likePost(key){
  const postRef = postsRef.child(key);
  postRef.once('value').then(snap => {
    const likes = snap.val().likes || 0;
    postRef.update({likes: likes + 1});
  });
}

// ======= اضافه کردن کامنت =======
function addComment(key){
  const input = document.getElementById(`c-${key}`);
  const text = input.value.trim();
  if(!text) return;
  const postRef = postsRef.child(key).child('comments');
  postRef.once('value').then(snap => {
    const comments = snap.val() || [];
    comments.push(text);
    postRef.set(comments);
    input.value = '';
  });
}