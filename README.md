## 1. DEVELOPMENT REQUIREMENTS
- [**Vue 3**](https://vuejs.org)
- [**Primevue**](https://primevue.org)
- [**NodeJs**](https://nodejs.org)
- [**qris-merchant-v2-be**](http://199.97.19.201:3888/michio/qris-acquirer-v2-be) (Back-End)

## 2. LOCAL INSTALLATION STEPS
- Download repo **qris-merchant-v2-fe**
- Jalankan perintah berikut untuk menginstall package pada **package.json**:  

        npm install

- Jalankan perintah berikut untuk menjalankan aplikasi secara local:

        npm run dev

- Jalankan perintah berikut untuk melakukan *manual build*:

        npm run build

## 3. DOCKER BUILD STEPS (MANUAL)
- Jalankan perintah berikut pada root aplikasi:  

        docker build -t container.banksulutgo.co.id:5000/qris-merchant-v2-fe:<TAG>

- Jalankan perintah berikut pada root aplikasi setelah container telah di-build:  

        docker-compose -f docker-compose.yml up -d  

    **note**: Pastikan **image**, **port** dan **environment** sudah disesuaikan

## 4. DEPLOYMENT
- Jalankan perintah berikut untuk menjalankan proses Deployment:  

        ./deploy.sh

    **note**: Proses Deployment akan melakukan tahapan berikut:
    - **Versioning**
    - **Build**
    - **Deployment**

    ### 4.1 Versioning
    Versioning secara *default* akan membaca versi terakhir pada file `changelogs.txt`, jika versioning belum ditentukan maka versi `0.0.1` akan digunakan. versi dapat diganti pada `changelogs.txt` pada line 5: 
        
        current_tag=${current_tag:-"0.0.1"}

    Hasil versioning menghasilkan *output* berikut:

        0.0.7
            - Update deployment script
            - Update deployment script
            - Add Term & Condition in Add Device
            - Update Tailwind Config
        0.0.6
            - Fix Date Checking
            - WIP
        0.0.5
            - Update Outlet Functionality
            - Minor Adjustments

        ...

    Pastikan untuk memberikan **tag** pada commit yang akan dibuat sebagai milestone versioning.

        git tag -a 0.0.2 -m "Tag message here"

    ### 4.2 Build
    Saat Proses Versioning telah selesai, proses build akan dibuat dengan nama `container.banksulutgo.co.id:5000/qris-merchant-v2-fe:<current_version>`. 
    
    `<current_version>` mangacuh pada versi terbaru pada `changelogs.txt`.

    ### 4.3 Deployment
    Deployment akan melakukan push pada repository tujuan **containker.banksulutgo.co.id:5000**

## 5. DEMO
Jalankan Demo dengan mengganti branch dari `main` ke `demo`:

    git checkout demo

Demo menjalankan aplikasi tanpa akses Back-End. untuk akses login dapat menggunakan username dan password berikut:
- user: **`demo`**
- pass: **`demo`**