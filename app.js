// Firebase bağlantı testi
console.log('Firebase config yükleniyor...');

import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    getDocs,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';

// DOM elementleri
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// Auth form elementleri
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');
// Chat elementleri
const currentUserName = document.getElementById('current-user-name');
const logoutBtn = document.getElementById('logout-btn');
const friendsList = document.getElementById('friends-list');
const addFriendBtn = document.getElementById('add-friend-btn');
const addFriendModal = document.getElementById('add-friend-modal');
const closeModal = document.getElementById('close-modal');
const friendEmail = document.getElementById('friend-email');
const sendFriendRequest = document.getElementById('send-friend-request');
const noChat = document.getElementById('no-chat');
const activeChat = document.getElementById('active-chat');
const chatUserName = document.getElementById('chat-user-name');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Global değişkenler
let currentUser = null;
let activeChatUser = null;
let messagesListener = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Auth state değişikliklerini dinle
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showChatInterface();
            loadUserData();
        } else {
            currentUser = null;
            showAuthInterface();
        }
    });

    // Event listener'ları ekle
    setupEventListeners();
});

// Event listener'ları ayarla
function setupEventListeners() {
    // Auth form geçişleri
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Auth butonları
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Enter tuşu ile form gönderimi
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    registerPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });

    // Arkadaş ekleme
    addFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
    });
    closeModal.addEventListener('click', () => {
        addFriendModal.classList.add('hidden');
        friendEmail.value = '';
    });
    sendFriendRequest.addEventListener('click', handleAddFriend);

    // Mesaj gönderme
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Modal dışına tıklayınca kapat
    addFriendModal.addEventListener('click', (e) => {
        if (e.target === addFriendModal) {
            addFriendModal.classList.add('hidden');
            friendEmail.value = '';
        }
    });
}

// Giriş işlemi
async function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    try {
        loginBtn.textContent = 'Giriş yapılıyor...';
        loginBtn.disabled = true;
        
        await signInWithEmailAndPassword(auth, email, password);
        
        // Form temizle
        loginEmail.value = '';
        loginPassword.value = '';
        
    } catch (error) {
        console.error('Giriş hatası:', error);
        let errorMessage = 'Giriş yapılırken bir hata oluştu!';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Hatalı şifre!';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz e-posta adresi!';
        }
        
        alert(errorMessage);
    } finally {
        loginBtn.textContent = 'Giriş Yap';
        loginBtn.disabled = false;
    }
}

// Kayıt işlemi
async function handleRegister() {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!name || !email || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (password.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!');
        return;
    }

    try {
        registerBtn.textContent = 'Kayıt olunuyor...';
        registerBtn.disabled = true;
        
        // Kullanıcı oluştur
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Profil güncelle
        await updateProfile(user, {
            displayName: name
        });
        
        // Firestore'da kullanıcı belgesi oluştur
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            createdAt: serverTimestamp(),
            friends: []
        });
        
        // Form temizle
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        
        alert('Kayıt başarılı! Hoş geldin!');
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        let errorMessage = 'Kayıt olurken bir hata oluştu!';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Bu e-posta adresi zaten kullanımda!';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz e-posta adresi!';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Şifre çok zayıf!';
        }
        
        alert(errorMessage);
    } finally {
        registerBtn.textContent = 'Kayıt Ol';
        registerBtn.disabled = false;
    }
}

// Çıkış işlemi
async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Çıkış hatası:', error);
        alert('Çıkış yapılırken bir hata oluştu!');
    }
}

// Auth arayüzünü göster
function showAuthInterface() {
    authContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
}

// Chat arayüzünü göster
function showChatInterface() {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
}

// Kullanıcı verilerini yükle
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Kullanıcı adını göster
        currentUserName.textContent = currentUser.displayName || 'Kullanıcı';
        
        // Arkadaşları yükle
        await loadFriends();
        
    } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
    }
}

// Arkadaşları yükle
async function loadFriends() {
    if (!currentUser) return;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const friends = userData.friends || [];
            
            // Arkadaş listesini temizle
            friendsList.innerHTML = '';
            
            if (friends.length === 0) {
                friendsList.innerHTML = '<p style="text-align: center; color: #a0aec0; padding: 20px;">Henüz arkadaşın yok.<br>Arkadaş ekle butonuna tıklayarak başla!</p>';
                return;
            }
            
            // Her arkadaş için bilgileri al ve listele
            for (const friendId of friends) {
                const friendDoc = await getDoc(doc(db, 'users', friendId));
                if (friendDoc.exists()) {
                    const friendData = friendDoc.data();
                    addFriendToList(friendId, friendData.name, friendData.email);
                }
            }
        }
    } catch (error) {
        console.error('Arkadaşlar yüklenirken hata:', error);
    }
}

// Arkadaş listesine ekle
function addFriendToList(friendId, friendName, friendEmail) {
    const friendItem = document.createElement('div');
    friendItem.className = 'friend-item';
    friendItem.dataset.friendId = friendId;
    
    friendItem.innerHTML = `
        <div class="friend-avatar">👤</div>
        <div class="friend-info">
            <div class="friend-name">${friendName}</div>
            <div class="friend-status">${friendEmail}</div>
        </div>
    `;
    
    friendItem.addEventListener('click', () => openChat(friendId, friendName));
    friendsList.appendChild(friendItem);
}

// Arkadaş ekleme
async function handleAddFriend() {
    const email = friendEmail.value.trim();
    
    if (!email) {
        alert('Lütfen e-posta adresi girin!');
        return;
    }
    
    if (email === currentUser.email) {
        alert('Kendini arkadaş olarak ekleyemezsin!');
        return;
    }
    
    try {
        sendFriendRequest.textContent = 'Ekleniyor...';
        sendFriendRequest.disabled = true;
        
        // E-posta ile kullanıcı ara
        const usersQuery = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(usersQuery);
        
        if (querySnapshot.empty) {
            alert('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı!');
            return;
        }
        
        const friendDoc = querySnapshot.docs[0];
        const friendData = friendDoc.data();
        const friendId = friendDoc.id;
        
        // Zaten arkadaş mı kontrol et
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = currentUserDoc.data();
        const currentFriends = currentUserData.friends || [];
        
        if (currentFriends.includes(friendId)) {
            alert('Bu kullanıcı zaten arkadaşın!');
            return;
        }
        
        // Her iki kullanıcının da arkadaş listesine ekle
        await updateDoc(doc(db, 'users', currentUser.uid), {
            friends: arrayUnion(friendId)
        });
        
        await updateDoc(doc(db, 'users', friendId), {
            friends: arrayUnion(currentUser.uid)
        });
        
        // Modal'ı kapat ve listeyi yenile
        addFriendModal.classList.add('hidden');
        friendEmail.value = '';
        await loadFriends();
        
        alert(`${friendData.name} arkadaş olarak eklendi!`);
        
    } catch (error) {
        console.error('Arkadaş ekleme hatası:', error);
        alert('Arkadaş eklenirken bir hata oluştu!');
    } finally {
        sendFriendRequest.textContent = 'Arkadaşlık İsteği Gönder';
        sendFriendRequest.disabled = false;
    }
}

// Sohbet aç
async function openChat(friendId, friendName) {
    // Önceki mesaj dinleyicisini kapat
    if (messagesListener) {
        messagesListener();
    }
    
    // Aktif arkadaşı güncelle
    activeChatUser = { id: friendId, name: friendName };
    
    // UI güncelle
    document.querySelectorAll('.friend-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-friend-id="${friendId}"]`).classList.add('active');
    
    noChat.classList.add('hidden');
    activeChat.classList.remove('hidden');
    chatUserName.textContent = friendName;
    
    // Mesajları yükle
    loadMessages(friendId);
}

// Mesajları yükle
function loadMessages(friendId) {
    if (!currentUser) return;
    
    // Chat ID oluştur (küçük ID önce gelecek şekilde)
    const chatId = currentUser.uid < friendId ? 
        `${currentUser.uid}_${friendId}` : 
        `${friendId}_${currentUser.uid}`;
    
    // Mesajları dinle
    const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
    );
    
    messagesListener = onSnapshot(messagesQuery, (snapshot) => {
        messagesContainer.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const message = doc.data();
            addMessageToChat(message);
        });
        
        // En alta kaydır
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// Mesajı chat'e ekle
function addMessageToChat(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`;
    
    const timestamp = message.timestamp ? 
        new Date(message.timestamp.seconds * 1000).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) : '';
    
    messageDiv.innerHTML = `
        <div class="message-text">${message.text}</div>
        <div class="message-time">${timestamp}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Mesaj gönder
async function sendMessage() {
    const text = messageInput.value.trim();
    
    if (!text || !activeChatUser) return;
    
    try {
        // Chat ID oluştur
        const chatId = currentUser.uid < activeChatUser.id ? 
            `${currentUser.uid}_${activeChatUser.id}` : 
            `${activeChatUser.id}_${currentUser.uid}`;
        
        // Mesajı Firestore'a ekle
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            timestamp: serverTimestamp()
        });
        
        // Input'u temizle
        messageInput.value = '';
        
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        alert('Mesaj gönderilemedi!');
    }
}