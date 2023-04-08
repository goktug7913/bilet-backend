# Bilet Satış Backend Test Projesi

## Proje Açıklaması
Bu proje, Bilet Satış Backend Test Projesi için hazırlanmıştır.
Proje TypeScript ile yazılmıştır ve bu yüzden derlenmesi gerekmektedir.

`npm run dev` komutu ile proje geliştirme modunda çalıştırılabilir. Bu mod, TypeScript destekli Nodemon çalıştırır.

## Kullanılan Teknolojiler
- Node.js - Server
- Express.js - Web Framework
- MongoDB - Veritabanı
- Prisma ORM - MongoDB ORM
- TypeScript - Dili
- JWT - Oturum yönetimi
- Bcrypt - Şifreleme
- Zod - Veri doğrulama
- Dotenv - Ortam değişkenleri
- Nodemon - Geliştirme modu

## Prisma ORM Hakkında (https://www.prisma.io/)
Prisma ORM, veritabanları ile etkileşim kurmak için kullanılan bir Object-Relational Mapping (ORM) kütüphanesidir.
Bu kütüphane, `schema.prisma` dosyasında tanımlanan veri modellerine göre dinamik olarak `prisma-client` kütüphanesini oluşturur.
Veritabanındaki modellerin TypeScript obje tiplerini içeren `prisma-client` kütüphanesini kullanarak MongoDB ile etkileşim gerçekleşmektedir.

Prisma Client modülü, dinamik olarak oluşturulduğundan, proje ilk defa çalıştırılmadan önce `primsa generate` komutu ile oluşturulması gerekmektedir.
Bu komut, `prisma-client` kütüphanesini oluşturur ve `schema.prisma` dosyasında yapılan değişiklikleri uygular.
`schema.prisma` dosyasında yapılan değişikliklerden sonra `prisma generate` komutu tekrar çalıştırılmalıdır.

# Proje Kurulumu
## Gereksinimler
- Node.js
- Local veya Remote MongoDB
- .env dosyası

### MongoDB
- Projeyi çalıştırmak için MongoDB gerekmektedir. MongoDB'yi local olarak çalıştırabilir veya MongoDB Atlas üzerinden bir veritabanı oluşturabilirsiniz.
- MongoDB Atlas üzerinden bir veritabanı oluşturmak için [buraya](https://www.mongodb.com/cloud/atlas/register) tıklayabilirsiniz.
- Local MongoDB'yi çalıştırmak için [buraya](https://www.mongodb.com/docs/manual/installation/) tıklayabilirsiniz.
- MongoDB'yi çalıştırdıktan sonra, veritabanı bağlantı adresini `.env` dosyasına eklemeniz gerekmektedir.
- MongoDB Atlas üzerinden bir veritabanı oluşturduysanız, bağlantı adresi şuna benzer olacaktır:
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-ismi>?retryWrites=true&w=majority
```
- Local MongoDB kullanıyorsanız, bağlantı adresi şuna benzer olacaktır:
```
mongodb://localhost:27017/<database-ismi>
```
- Bu bağlantı adreslerindeki köşeli parantezleri kaldırıp, kendi bilgilerinizi yazarak kullanmanız gerekmektedir. Örneğin:
```
mongodb://localhost:27017/bilet-satis
```
veya
```
mongodb+srv://admin:12345678@cluster1.abcde.mongodb.net/bilet-satis?retryWrites=true&w=majority
```

## Kurulum
- Bu projeyi klonlayın veya indirin.
- Klasörün içine girin.
- `npm install` komutunu çalıştırın.
- `.env` dosyasını oluşturun ve şu şekilde doldurun:
```
DATABASE_URL = Kullanacağınız MongoDB bağlantı adresi
PORT = Projenin çalışacağı port
JWT_SECRET = JWT için kullanılacak gizli anahtar
```
- Örnek .env dosyası, `.env.example` dosyasıdır. İsterseniz dosya adını `.env` olarak değiştirip, düzenleyerek kullanabilirsiniz.
- `npm run build` komutu ile projeyi derleyebilirsiniz. Bu komut, TypeScript dosyalarını JavaScript'e çevirir ve prisma-client kütüphanesini derler.
- Derleme bittiğinde `npm start` komutu ile projeyi başlatabilirsiniz.
- .env dosyasında PORT değişkeni belirtilmediyse, varsayılan olarak 5000 portu kullanılır.
- Sunucuyu ilk defa çalıştırdığınızda test verileri oluşturulacaktır ve konsola test kullanıcısının bilgileri yazılacaktır.

# API Endpointleri
## `POST /api/auth/register` - Kullanıcı kaydı
Girdi parametreleri JSON formatında body'de gönderilmelidir. Tüm parametreler zorunludur.
- `name` - İsim: Min 2 karakter, max 30 karakter
- `surname` - Soyisim: Min 2 karakter, max 40 karakter
- `email` - E-posta adresi: E-posta adresi formatında olmalıdır
- `password` - Şifre: Min 8 karakter, max 32 karakter
- `phone` - Telefon numarası: 10 haneli string olmalıdır (Örn: 5321234567)
- `gender` - Cinsiyet: String olarak `KADIN` veya `ERKEK` gönderilmelidir.
- `dateOfBirth` - Doğum tarihi: gg/aa/yyyy formatında string olmalıdır (Örn: 01/01/2000)

Parametreler doğrulanmışsa, kullanıcı kaydı oluşturulur ve kullanıcıya `Status Code 201` ile JSON body'de JWT tokeni gönderilir.
- `token` - JWT tokeni: 24 saat geçerlidir

Gönderilen parametrelerden biri veya daha fazlası doğrulanamadıysa,`Status Code 400` ile hata mesajı ve array olarak hata nedenleri gönderilir.
- `message` - Hata mesajı (Örn: `İsim en az 2 karakter olmalıdır. Soyisim en az 2 karakter olmalıdır.`)
- `errors` - Hata nedenleri ve ilgili mesaj (Zod tarafından oluşturulur)
- Örnek doğrulama hatası yanıtı:
- ```json
  {
    "message": "İsim en az 2 karakter olmalıdır. Soyisim en az 2 karakter olmalıdır.",
    "errors": [
      {
        "field": "name",
        "message": "İsim en az 2 karakter olmalıdır."
      },
      {
        "field": "surname",
        "message": "Soyisim en az 2 karakter olmalıdır."
      }
    ]
  }
  ```
- E-posta adresi zaten kayıtlıysa, sadece hata mesajı gönderilir.
- ```json
  { "message": "Bu e-posta adresi zaten kayıtlı." }
  ```

## `POST /api/auth/login` - Kullanıcı girişi
Girdi parametreleri JSON formatında body'de gönderilmelidir.
- `email` - E-posta adresi: E-posta adresi formatında olmalıdır
- `password` - Şifre: Min 8 karakter, max 32 karakter

Kullanıcı bilgileri doğrulanmışsa, kullanıcıya JSON body'de JWT tokeni gönderilir.
- `token` - JWT tokeni: 24 saat geçerlidir
- Giriş bilgileri hatalıysa, kullanıcı enumerasyonunu engellemek için `Status Code 400` ile generic hata mesajı gönderilir.
- ```json
  { "message": "E-posta adresi veya şifre hatalı." }
  ```
  
# Buradan itibaren tüm endpointler JWT tokeni gerektirir. Token `x-auth-token` header'ında gönderilmelidir.
## Token yoksa veya geçersizse, `Status Code 401` ile generic hata mesajı gönderilir.
```json
{ "message": "Lütfen tekrar giriş yapınız." }
```

## `GET /api/sefer/?from=&to=` - Seferleri listele
Girdi parametreleri URL'de gönderilmelidir. `x-auth-token` header'ında JWT tokeni gönderilmelidir.
- `from` - Kalkış şehir ismi (Örn: `istanbul`)
- `to` - Varış şehir ismi (Örn: `ankara`)
- Örnek URL: `http://localhost:5000/api/sefer/?from=istanbul&to=ankara`
- Bir veya daha fazla sefer bulunursa, seferler JSON body'de gönderilir.
- Sadece kalkış veya sadece varış şehri girilmişse, o şehirdeki tüm seferler gönderilir. İkisi de girilmişse, o şehirler arasındaki seferler gönderilir.
- Birden fazla sefer bulunuyorsa, en erkenden en geçe doğru sıralanır.
- ```json
  [
    {
      "id": "212f03d3af42284f8e3f5f42",
      "seferNo": "IST-ANK-1",
      "from": "istanbul",
      "to": "ankara",
      "dateTime": "2021-07-15T00:00:00.000Z",
      "price": 100
    },
    {
      "id": "642f03d3af42284f8e3f5f22",
      "seferNo": "IST-ANK-2",
      "from": "istanbul",
      "to": "ankara",
      "dateTime": "2021-07-18T00:00:00.000Z",
      "price": 100
    }
  ]
  ```
- Sefer bulunamazsa, sadece mesaj gönderilir.
- ```json
  { "message": "Sefer bulunamadı." }
  ```
  
## `GET /api/sefer/detay/?id=` - Sefer detayı
Girdi parametreleri URL'de gönderilmelidir. `x-auth-token` header'ında JWT tokeni gönderilmelidir.
- `id` - Sefer ID'si: String olarak MongoDB ObjectID'si (Örn: `642f03d3af42284f8e3f5f22`)
- Sefer bulunursa, detaylar JSON body'de gönderilir.
- Koltuk grupları bilet satın alma endpoint'inde açıklanmıştır.
- ```json
  {
    "id": "642f03d3af42284f8e3f5f22",
    "seatCount": 3,
    "seats": [
        {
            "seatNo": 1,
            "sold": false,
            "gender": "NA"
        },
        {
            "seatNo": 2,
            "sold": false,
            "gender": "NA"
        },
        {
            "seatNo": 3,
            "sold": false,
            "gender": "NA"
        }
    ]
  }
  ```
- id: Sefer ID'si
- seatCount: Seferdeki koltuk sayısı
- seats: Koltukların detaylarını içeren array
- seatNo: Koltuk numarası
- sold: Koltuk satın alınmışsa true, satın alınmamış ise false
- gender: Koltukta oturan kişinin cinsiyeti. Koltuk satın alınmamışsa "NA" değeri gönderilir. Satın alınmış ise `KADIN` veya `ERKEK` değeri gönderilir.

Sefer bulunamazsa, sadece mesaj gönderilir.
- ```json
  { "message": "Sefer bulunamadı." }
  ```
  
## `POST /api/bilet/satis` - Bilet satın al
Girdi parametreleri JSON formatında body'de gönderilmelidir. `x-auth-token` header'ında JWT tokeni gönderilmelidir.
- `seferId` - Sefer ID'si: String olarak MongoDB ObjectID'si (Örn: `642f03d3af42284f8e3f5f22`)
- `seats` - Satın alınacak koltukların array'i, yapısı aşağıda açıklanmıştır.
Örnek request:

```json
{
  "seferId": "642f03d3af42284f8e3f5f22",
  "seats": [
    {
      "seatNo": 3,
      "gender": "KADIN"
    },
    {
      "seatNo": 4,
      "gender": "ERKEK"
    }
  ]
}
```
### Koltuk gruplama
- Koltuklar çiftli şekilde gruplanmıştır. 1. ve 2. koltuk yan yana, 3. ve 4. koltuk yan yana... şeklindedir.
- Koltuk çiftlerinde, tek kişi için bilet alınıyorsa çiftteki diğer koltuk ile aynı cinsiyette olmalıdır.
- Yani, 1. koltuk için bilet alınıyorsa, 2. koltuk da aynı cinsiyette olmalıdır. 3. koltuk için bilet alınıyorsa, 4. koltuk da aynı cinsiyette olmalıdır.
- Eğer iki koltuğun da cinsiyeti `NA` ise, herhangi bir koltuk için bilet alınabilir. (Satın alınmamış koltuklar NA olarak gönderilir.)
- Çiftteki iki koltuk birden satın alınıyorsa, herhangi bir cinsiyet olabilir.

### `GET /api/bilet/biletlerim` - Kullanıcının biletleri
Kullanıcının biletlerini içeren bir array döndürmektedir. `x-auth-token` header'ında JWT tokeni gönderilmelidir.
- Girdi parametresi yoktur, JWT tokeni ile kullanıcı bilgisi alınır.
- `id` - Bilet ID'si: String olarak MongoDB ObjectID'si (Örn: `642f03d3af42284f8e3f5f22`)


  Örnek response:

```json
[
    {
      "id": "6431062c615ae34d2d6cd341"
    },
    {
      "id": "6431078f615ae34d2d6cd342"
    },
    {
      "id": "643108c27f5429d6000b6f0d"
    },
    {
      "id": "64310908d851e0344b5cc244"
    }
]
```

### `GET /api/bilet/biletlerim/detay/?bilet=` - Kullanıcının bilet detayı
Girdi parametreleri URL'de gönderilmelidir. `x-auth-token` header'ında JWT tokeni gönderilmelidir.
- `bilet` - Bilet ID'si: String olarak MongoDB ObjectID'si (Örn: `642f03d3af42284f8e3f5f22`)

Bilet bulunursa, detaylar JSON body'de gönderilir.
- `id` - Bilet ID'si
- `seferId` - Sefer ID'si (MongoDB ObjectID'si)
- `from` - Seferin başlangıç noktası
- `to` - Seferin bitiş noktası
- `time` - Seferin saati (Local saat diliminde)
- `seatNums` - Biletin koltuk numaraları

Örnek response:
```json
{
  "id": "6431a6488e7fc44615569236",
  "seferId": "642f03d3af42284f8e3f5f22",
  "from": "ADANA",
  "to": "ANKARA",
  "time": "8:39:29 PM",
  "seatNums": [
    35,
    34,
    24,
    63,
    64
  ]
}
```