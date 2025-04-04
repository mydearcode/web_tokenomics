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
    │   ├── auth.js         # Kimlik doğrulama middleware'i
    │   └── projectAccess.js # Proje erişim kontrolü middleware'i
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

## Özellikler

### Token Ekonomisi Yönetimi
- Token dağılımı tasarımı ve düzenleme
- Kategori bazlı token allocation
- Özelleştirilebilir token bilgileri (isim, sembol, toplam arz)

### Vesting Çizelgesi
- Kategori bazlı vesting ayarları
- TGE (Token Generation Event) yüzdesi ayarlama
- Cliff ve vesting süresi yapılandırma
- Aylık vesting dağılımı görselleştirme

### Proje Yönetimi
- Proje oluşturma ve düzenleme
- Proje detayları görüntüleme
- Proje görünürlük kontrolü (public/private)

### İşbirlikçi Sistemi
- Proje işbirlikçisi ekleme/çıkarma
- Rol tabanlı erişim kontrolü (owner, editor, viewer)
- İşbirlikçiler için yetki yönetimi

### Kullanıcı Arayüzü
- Responsive tasarım
- Accordion ile gelişmiş vesting görünümü
- Doğru milestone numaralandırma

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

## Son Eklenen Özellikler

### İşbirliği Sistemi
- Projelere işbirlikçi ekleme ve yönetme
- İşbirlikçi rolleri: editor ve viewer
- Rol bazlı erişim kontrolü

### Düzenleme Yetkisi Kontrolü
- Editor rolüne sahip kullanıcılar projeyi düzenleyebilir
- Viewer rolüne sahip kullanıcılar sadece görüntüleyebilir
- Proje sahibi tüm yetkilere sahiptir

### UX İyileştirmeleri
- Vesting tabloları için Accordion bileşeni eklendi
- Milestone numaralandırma sorunu çözüldü (M1, M2, M3... sıralaması)
- Form doğrulama ve hata mesajları iyileştirildi

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
  collaborators: [{
    user: ObjectId,
    role: String  // "editor" veya "viewer"
  }],
  tokenomics: {
    tokenName: String,
    tokenSymbol: String,
    totalSupply: Number,
    allocation: {
      team: {
        percentage: Number,
        amount: Number
      },
      investors: {
        percentage: Number,
        amount: Number
      },
      // Diğer kategoriler...
    }
  },
  vesting: {
    team: {
      tgePercentage: Number,
      cliffMonths: Number,
      vestingMonths: Number
    },
    investors: {
      tgePercentage: Number,
      cliffMonths: Number,
      vestingMonths: Number
    },
    // Diğer kategoriler...
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
- `GET /api/projects/:id/check-access`: Proje erişim kontrolü
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

## Yapılacaklar Listesi

### 1. Deploy ve Hosting Yapısı
- **Uygun Hosting Platformu Seçimi**
  - Heroku, AWS, DigitalOcean veya Vercel gibi platformların değerlendirilmesi
  - Ölçeklenebilirlik gereksinimlerinin belirlenmesi
  - Maliyet-performans analizi

- **Veritabanı Hizmeti**
  - MongoDB Atlas veya AWS DocumentDB gibi hizmetlerin değerlendirilmesi
  - Yedekleme ve kurtarma stratejilerinin planlanması
  - Veritabanı performans optimizasyonu

- **CI/CD Pipeline Kurulumu**
  - GitHub Actions veya benzeri araçlarla otomatik deploy
  - Test, build ve deploy süreçlerinin otomasyonu
  - Sürüm kontrolü ve rollback stratejileri

- **Domain ve SSL Yapılandırması**
  - Domain adı seçimi ve yapılandırması
  - SSL sertifikası ile güvenli bağlantı
  - CDN entegrasyonu

### 2. UX Odaklı İyileştirmeler

- **Kullanıcı Arayüzü**
  - Karanlık mod desteği
  - Responsive tasarım geliştirmeleri
  - Tutarlı renk şeması ve tipografi
  - Animasyon ve geçiş efektleri

- **Kullanıcı Deneyimi**
  - Sürükle-bırak arayüz elemanları
  - İnteraktif grafik ve tablolar
  - Form doğrulama ve kullanıcı geri bildirimleri
  - Tutorial ve yardım metinleri

- **Performans İyileştirmeleri**
  - Sayfa yükleme süresi optimizasyonu
  - Büyük veri setleri için sanal kaydırma
  - İmaj optimizasyonu

- **Erişilebilirlik**
  - Klavye navigasyonu ve odak yönetimi
  - ARIA etiketleri ve rolleri
  - Renk kontrastı iyileştirmeleri
  - Ekran okuyucu uyumluluğu

## Geliştirme Ortamı Kurulumu

1. Repoyu klonlayın:
   ```bash
   git clone <repo-url>
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   # Backend bağımlılıkları
   cd server
   npm install

   # Frontend bağımlılıkları
   cd ../client
   npm install
   ```

3. Backend için `.env` dosyası oluşturun:
   ```
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=mongodb://localhost:27017/tokenomics-web
   ```

4. Uygulamayı başlatın:
   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend
   cd ../client
   npm start
   ```

## Katkıda Bulunma
1. Repoyu forklayın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın 