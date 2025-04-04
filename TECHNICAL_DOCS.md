# Tokenomics Web - Teknik Dokümantasyon

Bu dokümantasyon, Tokenomics Web projesinin teknik detaylarını ve geliştirme sürecini açıklar.

## Geliştirme Ortamı

- **İşletim Sistemi**: macOS (darwin 24.3.0)
- **Çalışma Dizini**: /Users/mihrac/tokenomics
- **Kabuk**: /bin/zsh
- **Versiyon Kontrolü**: Git

## Proje Mimarisi

### Backend (Node.js/Express)

Backend, RESTful API mimarisi kullanılarak geliştirilmiştir. Temel bileşenler:

1. **Veritabanı Modelleri**:
   - Mongoose ODM kullanılarak MongoDB şemaları tanımlanmıştır
   - Kullanıcı ve proje modelleri oluşturulmuştur
   - Şema doğrulama ve özel metodlar eklenmiştir

2. **Middleware**:
   - Kimlik doğrulama middleware'i JWT kullanarak token doğrulaması yapar
   - Proje erişim kontrolü middleware'i kullanıcı rollerine göre erişim sağlar
   - Hata işleme middleware'i tutarlı hata yanıtları döndürür

3. **API Rotaları**:
   - RESTful prensiplere uygun endpoint'ler tanımlanmıştır
   - Her rota dosyası belirli bir kaynağa odaklanır (auth, projects, users)
   - Rotalar, ilgili middleware'leri kullanarak güvenliği sağlar

4. **Sunucu Yapılandırması**:
   - Express uygulaması oluşturulmuştur
   - CORS, JSON parsing gibi middleware'ler eklenmiştir
   - MongoDB bağlantısı yapılandırılmıştır
   - Production modunda statik dosyalar sunulur

### Frontend (React)

Frontend, modern React uygulaması mimarisi kullanılarak geliştirilmiştir:

1. **Bileşen Yapısı**:
   - Fonksiyonel bileşenler ve React Hooks kullanılmıştır
   - Bileşenler mantıksal olarak gruplandırılmıştır (pages, components, context)
   - Material-UI kütüphanesi ile tutarlı UI sağlanmıştır

2. **Durum Yönetimi**:
   - React Context API kullanılarak global durum yönetimi sağlanmıştır
   - AuthContext, kimlik doğrulama durumunu yönetir
   - Bileşenler arası veri paylaşımı props ve context ile yapılır

3. **Yönlendirme**:
   - React Router kullanılarak sayfa yönlendirmesi sağlanmıştır
   - PrivateRoute bileşeni ile korumalı rotalar tanımlanmıştır
   - Dinamik rotalar için URL parametreleri kullanılmıştır

4. **API İletişimi**:
   - Axios kütüphanesi ile API istekleri yapılmıştır
   - İstek başlıklarına JWT token'ı eklenmiştir
   - Hata işleme ve yükleme durumları yönetilmiştir

5. **Grafik Bileşenleri**:
   - Chart.js ve React-Chartjs-2 kullanılarak grafikler oluşturulmuştur
   - TokenAllocationChart bileşeni, token dağılımını pasta grafik ile gösterir
   - Grafikler responsive tasarıma uygun olarak yapılandırılmıştır

## Geliştirme Süreci Detayları

### 1. Proje Kurulumu

1. Git deposu oluşturuldu:
   ```bash
   git init
   ```

2. `.gitignore` dosyası oluşturuldu:
   - Node modülleri, build dosyaları, ortam değişkenleri ve IDE dosyaları için kurallar eklendi

3. Proje yapısı oluşturuldu:
   - Frontend ve backend için ayrı klasörler
   - Temel dosya yapısı ve bağımlılıklar

### 2. Backend Geliştirme

1. **Veritabanı Modelleri**:
   - `User.js`: Kullanıcı şeması, şifre hashleme ve karşılaştırma metodları
   - `Project.js`: Proje şeması, tokenomics veri yapısı ve güncelleme işlemleri

2. **Middleware**:
   - `auth.js`: JWT doğrulama, kullanıcı erişimi ve rol kontrolü
   - `projectAccess.js`: Proje sahipliği, işbirlikçi erişimi ve düzenleme izinleri

3. **API Rotaları**:
   - `auth.js`: Kayıt, giriş ve profil yönetimi işlemleri
   - `projects.js`: CRUD işlemleri, işbirlikçi yönetimi ve görünürlük kontrolü
   - `users.js`: Kullanıcı yönetimi ve profil güncelleme

4. **Sunucu Yapılandırması**:
   - Express uygulaması ve middleware'ler
   - MongoDB bağlantısı ve hata işleme
   - Production modu için statik dosya sunumu

### 3. Frontend Geliştirme

1. **Kimlik Doğrulama**:
   - `AuthContext.js`: Kullanıcı durumu, token yönetimi ve kimlik doğrulama işlemleri
   - `PrivateRoute.js`: Korumalı rotalar için yönlendirme kontrolü

2. **Sayfa Bileşenleri**:
   - Form işleme, veri doğrulama ve API istekleri
   - Yükleme durumları ve hata işleme
   - Responsive tasarım ve kullanıcı deneyimi

3. **Grafik Bileşenleri**:
   - Chart.js yapılandırması ve özelleştirme
   - Veri dönüşümü ve görselleştirme
   - Etkileşimli grafik özellikleri

## Teknik Kararlar ve Gerekçeleri

1. **MongoDB ve Mongoose**:
   - Esnek şema yapısı, tokenomics verilerinin değişken doğasına uygun
   - Mongoose ODM, şema doğrulama ve middleware'ler ile güvenli veri işleme
   - JSON benzeri döküman yapısı, frontend-backend veri alışverişini kolaylaştırır

2. **JWT Kimlik Doğrulama**:
   - Durumsuz kimlik doğrulama, ölçeklenebilirlik sağlar
   - Token tabanlı yaklaşım, mobil uygulama entegrasyonuna uygun
   - Güvenli ve standart bir kimlik doğrulama protokolü

3. **React ve Material-UI**:
   - Bileşen tabanlı mimari, yeniden kullanılabilir UI elemanları
   - Material-UI, tutarlı ve modern bir kullanıcı arayüzü
   - Geniş ekosistem ve topluluk desteği

4. **Chart.js**:
   - Hafif ve performanslı grafik kütüphanesi
   - Özelleştirilebilir ve responsive grafikler
   - Zengin dokümantasyon ve topluluk desteği

## Güvenlik Önlemleri

1. **Kimlik Doğrulama ve Yetkilendirme**:
   - JWT token'ları ile güvenli kimlik doğrulama
   - Rol tabanlı erişim kontrolü (admin, user)
   - Proje bazlı erişim kontrolü (sahip, işbirlikçi, herkese açık)

2. **Veri Güvenliği**:
   - Şifreler bcrypt ile hashlenir
   - Hassas bilgiler (şifreler, token'lar) yanıtlarda gizlenir
   - MongoDB injection koruması Mongoose ile sağlanır

3. **API Güvenliği**:
   - CORS yapılandırması ile güvenli cross-origin istekleri
   - Rate limiting ve güvenlik başlıkları
   - Hata mesajlarında hassas bilgilerin gizlenmesi

## Performans Optimizasyonları

1. **Backend**:
   - Veritabanı sorgularında indeksleme
   - Middleware zincirinde verimli sıralama
   - Hata işleme ve loglama optimizasyonu

2. **Frontend**:
   - Bileşen render optimizasyonu
   - Lazy loading ve code splitting
   - Grafik render performansı optimizasyonu

## Test Stratejisi

1. **Backend Testleri**:
   - Birim testleri: Model metodları ve yardımcı fonksiyonlar
   - Entegrasyon testleri: API endpoint'leri ve veritabanı işlemleri
   - Güvenlik testleri: Kimlik doğrulama ve yetkilendirme

2. **Frontend Testleri**:
   - Bileşen testleri: UI bileşenleri ve davranışları
   - Hook testleri: Özel React hook'ları
   - Entegrasyon testleri: Sayfa işlevselliği ve API entegrasyonu

## Dağıtım Stratejisi

1. **Frontend Dağıtımı**:
   - React uygulaması build edilir (`npm run build`)
   - Statik dosyalar CDN veya sunucuya yüklenir
   - Environment değişkenleri production değerleriyle yapılandırılır

2. **Backend Dağıtımı**:
   - Node.js uygulaması production modunda çalıştırılır
   - PM2 veya benzeri process manager kullanılır
   - MongoDB bağlantısı production URI ile yapılandırılır

3. **CI/CD Pipeline**:
   - GitHub Actions veya benzeri CI/CD araçları
   - Otomatik test ve build süreçleri
   - Otomatik dağıtım ve deployment

## Gelecek Geliştirmeler

1. **Form Doğrulama ve Hata İşleme**:
   - Formik veya React Hook Form entegrasyonu
   - Yup veya Zod ile şema doğrulama
   - Gelişmiş hata mesajları ve kullanıcı geri bildirimi

2. **UI/UX İyileştirmeleri**:
   - Tema özelleştirme ve karanlık mod
   - Animasyonlar ve geçiş efektleri
   - Erişilebilirlik (a11y) iyileştirmeleri

3. **Token Fiyat Simülasyonu**:
   - Token ekonomisi modelleme
   - Fiyat tahmin algoritmaları
   - Simülasyon grafikleri ve raporlar

4. **Çoklu Dil Desteği**:
   - i18next entegrasyonu
   - Dil dosyaları ve çeviriler
   - Dil değiştirme arayüzü

5. **Mobil Uygulama**:
   - React Native ile cross-platform mobil uygulama
   - Mobil özel UI/UX tasarımı
   - Push bildirimleri ve offline mod 