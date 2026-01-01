# 🍌 BananaChat

Firebase tabanlı gerçek zamanlı sohbet uygulaması

## Özellikler

- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Arkadaş ekleme sistemi
- ✅ Gerçek zamanlı mesajlaşma
- ✅ Responsive tasarım
- ✅ Modern ve kullanıcı dostu arayüz

## Kurulum

### 1. Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Create a project" butonuna tıklayın
3. Proje adını "bananachat" olarak girin
4. Google Analytics'i istediğiniz gibi ayarlayın

### 2. Firebase Yapılandırması

1. Firebase Console'da projenizi açın
2. Sol menüden "Project Settings" (⚙️) tıklayın
3. "General" sekmesinde "Your apps" bölümüne gidin
4. "Web" (</>) ikonuna tıklayın
5. App nickname'i "BananaChat" olarak girin
6. "Register app" butonuna tıklayın
7. Verilen config bilgilerini kopyalayın

### 3. Firebase Servislerini Etkinleştirin

#### Authentication:
1. Sol menüden "Authentication" tıklayın
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" seçeneğini etkinleştirin

#### Firestore Database:
1. Sol menüden "Firestore Database" tıklayın
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (geliştirme için)
4. Location seçin (Europe-west3 önerilir)

### 4. Bağımlılıkları Yükleyin

```bash
npm install
```

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Kullanım

1. **Kayıt Ol**: İlk kez kullanıyorsanız kayıt olun
2. **Giriş Yap**: Mevcut hesabınızla giriş yapın
3. **Arkadaş Ekle**: "+" butonuna tıklayarak arkadaşlarınızın e-posta adreslerini ekleyin
4. **Sohbet Et**: Arkadaş listesinden birine tıklayarak sohbete başlayın

## Güvenlik Kuralları (Üretim için)

Firestore güvenlik kurallarını güncelleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi belgelerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat mesajları sadece katılımcılar tarafından okunabilir/yazılabilir
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        (chatId.matches('.*' + request.auth.uid + '.*'));
    }
  }
}
```

## Teknolojiler

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Authentication, Firestore Database
- **Hosting**: Firebase Hosting (opsiyonel)

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.