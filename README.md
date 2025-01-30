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

        2.1.24
            - Add Terminal's Username on Reset Device
            - Seperate Bar Chart by Merchant & Outlet each Branches
            - Adjust metaURL null coalescing
            - Unify Docker image
            - Merge remote-tracking branch 'origin/master'
            - Implemented NGINX's SSI for Dynamic URL for compose
            - Implemente NGINX's SSI for Dynamic URL for compose
        2.1.23
            - auto-changelogs
            - Add Save State for Registration
            - Add Period Selection for ON/OFF-US Report
        2.1.22
            - auto-changelogs
            - Add MDR Report
            - Replace UNI to PSO
            - Update Downloaded Report Name
            - Fix Year Selection on Reporting
            - Add ON-US, ACQ-OFF-US & ISS-OFF-US Reports
            - Update Report Load State

        ...

    Pastikan untuk memberikan **tag** pada commit yang akan dibuat sebagai milestone versioning.

        git tag -a 0.0.2 -m "Tag message here"

    ### 4.2 Build
    Saat Proses Versioning telah selesai, proses build akan dibuat dengan nama `container.banksulutgo.co.id:5000/qris-merchant-v2-fe:<current_version>`. 
    
    `<current_version>` mangacuh pada versi terbaru pada `changelogs.txt`.

    ### 4.3 Deployment
    Deployment akan melakukan push pada repository tujuan **containker.banksulutgo.co.id:5000**