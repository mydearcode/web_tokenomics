# Tokenomics Web

Tokenomics Web, token ekonomisi tasarımı ve yönetimi için geliştirilmiş bir web uygulamasıdır. Kullanıcıların token projeleri oluşturmasına, düzenlemesine ve token dağılımını görselleştirmesine olanak tanır.

## Proje Yapısı

```
tokenomics-web/
├── client/                 # React frontend
│   ├── public/             # Statik dosyalar
│   └── src/                # Kaynak kodlar
│       ├── components/     # Yeniden kullanılabilir bileşenler
│       │   ├── charts/     # Grafik bileşenleri
│       │   ├── layout/     # Düzen bileşenleri
│       │   └── routing/    # Yönlendirme bileşenleri
│       ├── context/        # React context'leri
│       ├── pages/          # Sayfa bileşenleri
│       ├── App.js          # Ana uygulama bileşeni
│       └── index.js        # Giriş noktası
└── server/                 # Node.js backend
    ├── middleware/         # Middleware fonksiyonları
    ├── models/             # Mongoose modelleri
    ├── routes/             # API rotaları
    └── server.js           # Sunucu başlatma dosyası
```

## Teknoloji Yığını

### Frontend
- **React**: UI bileşenleri için
- **Material-UI**: UI tasarımı ve bileşenleri için
- **React Router**: Sayfa yönlendirmesi için
- **Chart.js & React-Chartjs-2**: Token dağılımı grafikleri için
- **Axios**: API istekleri için

### Backend
- **Node.js & Express**: Sunucu çerçevesi
- **MongoDB & Mongoose**: Veritabanı ve ODM
- **JWT**: Kimlik doğrulama için
- **Bcrypt**: Şifre hashleme için

## Geliştirme Süreci

### 1. Proje Kurulumu
- Git deposu oluşturuldu
- `.gitignore` dosyası hazırlandı
- Frontend ve backend için temel yapı oluşturuldu

### 2. Backend Geliştirme
- **Veritabanı Modelleri**:
  - `User.js`: Kullanıcı bilgileri ve kimlik doğrulama
  - `Project.js`: Token projeleri ve tokenomics verileri

- **Middleware**:
  - `auth.js`: JWT tabanlı kimlik doğrulama
  - `projectAccess.js`: Proje erişim kontrolü

- **API Rotaları**:
  - `auth.js`: Kayıt, giriş ve profil yönetimi
  - `projects.js`: Proje CRUD işlemleri
  - `users.js`: Kullanıcı yönetimi

- **Sunucu Yapılandırması**:
  - Express uygulaması
  - MongoDB bağlantısı
  - CORS ve JSON middleware
  - Hata işleme

### 3. Frontend Geliştirme
- **Kimlik Doğrulama**:
  - `AuthContext.js`: Kimlik doğrulama durumu yönetimi
  - `PrivateRoute.js`: Korumalı rotalar

- **Sayfa Bileşenleri**:
  - `Home.js`: Ana sayfa
  - `Login.js` & `Register.js`: Kimlik doğrulama
  - `Dashboard.js`: Kullanıcı gösterge paneli
  - `ProjectList.js`: Proje listesi
  - `ProjectCreate.js` & `ProjectEdit.js`: Proje oluşturma/düzenleme
  - `ProjectView.js`: Proje detayları ve grafikler
  - `Profile.js`: Kullanıcı profili

- **Grafik Bileşenleri**:
  - `TokenAllocationChart.js`: Pasta grafik ile token dağılımı

- **Düzen Bileşenleri**:
  - `Navbar.js`: Navigasyon çubuğu
  - `Footer.js`: Alt bilgi

## Veri Modelleri

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
}
```

### Project Model
```javascript
{
  name: String,
  description: String,
  owner: ObjectId,
  collaborators: [ObjectId],
  tokenomics: {
    tokenName: String,
    tokenSymbol: String,
    totalSupply: Number,
    allocation: {
      team: Number,
      investors: Number,
      community: Number,
      treasury: Number,
      marketing: Number,
      development: Number
    },
    // Diğer tokenomics alanları...
  },
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register`: Kullanıcı kaydı
- `POST /api/auth/login`: Kullanıcı girişi
- `GET /api/auth/me`: Mevcut kullanıcı bilgileri

### Projeler
- `GET /api/projects`: Tüm projeleri listele
- `GET /api/projects/:id`: Proje detayları
- `POST /api/projects`: Yeni proje oluştur
- `PUT /api/projects/:id`: Proje güncelle
- `DELETE /api/projects/:id`: Proje sil
- `POST /api/projects/:id/collaborators`: İşbirlikçi ekle
- `DELETE /api/projects/:id/collaborators/:userId`: İşbirlikçi kaldır
- `PATCH /api/projects/:id/visibility`: Görünürlüğü değiştir

### Kullanıcılar
- `GET /api/users`: Tüm kullanıcıları listele (admin)
- `GET /api/users/:id`: Kullanıcı profili
- `PUT /api/users/:id`: Profil güncelle
- `PUT /api/users/:id/password`: Şifre güncelle
- `DELETE /api/users/:id`: Kullanıcı sil (admin)

## Güvenlik Önlemleri
- JWT tabanlı kimlik doğrulama
- Şifre hashleme (bcrypt)
- Rol tabanlı erişim kontrolü
- Proje erişim kontrolü (sahip, işbirlikçi, herkese açık)
- CORS yapılandırması
- Hata mesajlarında hassas bilgilerin gizlenmesi

## Dağıtım
- Frontend: React uygulaması build edilir ve statik dosyalar sunulur
- Backend: Node.js uygulaması production modunda çalıştırılır
- Veritabanı: MongoDB bağlantısı production URI ile yapılandırılır

## Gelecek Geliştirmeler
- Form doğrulama ve hata işleme geliştirmeleri
- Daha gelişmiş UI/UX özellikleri
- Token fiyat simülasyonu
- Çoklu dil desteği
- Mobil uygulama 