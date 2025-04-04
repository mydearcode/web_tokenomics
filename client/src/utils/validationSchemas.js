import * as Yup from 'yup';

// Kullanıcı kayıt formu doğrulama şeması
export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(50, 'Ad soyad en fazla 50 karakter olabilir')
    .required('Ad soyad zorunludur'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
    )
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

// Kullanıcı giriş formu doğrulama şeması
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .required('Şifre zorunludur'),
});

// Proje oluşturma/düzenleme formu doğrulama şeması
export const projectSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Proje adı en az 2 karakter olmalıdır')
    .max(100, 'Proje adı en fazla 100 karakter olabilir')
    .required('Proje adı zorunludur'),
  description: Yup.string()
    .min(10, 'Proje açıklaması en az 10 karakter olmalıdır')
    .max(1000, 'Proje açıklaması en fazla 1000 karakter olabilir')
    .required('Proje açıklaması zorunludur'),
  isPublic: Yup.boolean(),
  tokenomics: Yup.object().shape({
    tokenName: Yup.string()
      .min(2, 'Token adı en az 2 karakter olmalıdır')
      .max(50, 'Token adı en fazla 50 karakter olabilir')
      .required('Token adı zorunludur'),
    tokenSymbol: Yup.string()
      .min(2, 'Token sembolü en az 2 karakter olmalıdır')
      .max(10, 'Token sembolü en fazla 10 karakter olabilir')
      .required('Token sembolü zorunludur'),
    totalSupply: Yup.number()
      .min(1, 'Toplam token arzı 0\'dan büyük olmalıdır')
      .required('Toplam token arzı zorunludur'),
    allocation: Yup.object().shape({
      team: Yup.number()
        .min(0, 'Takım payı 0\'dan küçük olamaz')
        .max(100, 'Takım payı 100\'den büyük olamaz')
        .required('Takım payı zorunludur'),
      marketing: Yup.number()
        .min(0, 'Pazarlama payı 0\'dan küçük olamaz')
        .max(100, 'Pazarlama payı 100\'den büyük olamaz')
        .required('Pazarlama payı zorunludur'),
      development: Yup.number()
        .min(0, 'Geliştirme payı 0\'dan küçük olamaz')
        .max(100, 'Geliştirme payı 100\'den büyük olamaz')
        .required('Geliştirme payı zorunludur'),
      liquidity: Yup.number()
        .min(0, 'Likidite payı 0\'dan küçük olamaz')
        .max(100, 'Likidite payı 100\'den büyük olamaz')
        .required('Likidite payı zorunludur'),
      treasury: Yup.number()
        .min(0, 'Hazine payı 0\'dan küçük olamaz')
        .max(100, 'Hazine payı 100\'den büyük olamaz')
        .required('Hazine payı zorunludur'),
      community: Yup.number()
        .min(0, 'Topluluk payı 0\'dan küçük olamaz')
        .max(100, 'Topluluk payı 100\'den büyük olamaz')
        .required('Topluluk payı zorunludur'),
      advisors: Yup.number()
        .min(0, 'Danışmanlar payı 0\'dan küçük olamaz')
        .max(100, 'Danışmanlar payı 100\'den büyük olamaz')
        .required('Danışmanlar payı zorunludur'),
      partners: Yup.number()
        .min(0, 'İş ortakları payı 0\'dan küçük olamaz')
        .max(100, 'İş ortakları payı 100\'den büyük olamaz')
        .required('İş ortakları payı zorunludur'),
    }).test(
      'total-allocation',
      'Token dağılımı toplamı 100 olmalıdır',
      (value) => {
        const total = Object.values(value).reduce((sum, val) => sum + val, 0);
        return Math.abs(total - 100) < 0.01;
      }
    ),
  }),
});

// Profil güncelleme formu doğrulama şeması
export const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(50, 'Ad soyad en fazla 50 karakter olabilir')
    .required('Ad soyad zorunludur'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
});

// Şifre değiştirme formu doğrulama şeması
export const passwordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Mevcut şifre zorunludur'),
  newPassword: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
    )
    .required('Yeni şifre zorunludur'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
}); 