let serverURL = "http://localhost:3000/"


window.onload = () => {
    document.querySelectorAll('#preview-img-input, #main-img-input').forEach((el) => el.addEventListener('change', function (el) {
            let value = this.value.split('\\');
            let fileName = value[value.length - 1]
            console.log('value', this)
            el.target.nextSibling.nextElementSibling.innerHTML = fileName;
        })
    )

    listNews()
}

ClassicEditor
    .create(document.querySelector('#editor'), {
        removePlugins: ['ImageUpload'],
        language: 'ru',
        height: '300px'
    })
    .then(editor => {

        editor.setData('<p>Текст новости</p>');

        document.querySelector('#submit-btn').addEventListener('click', () => {
            const contentData = editor.getData();
            console.log(contentData)
            createNewsItem(contentData).then( (success) => {
                if (success) {
                    editor.setData('<p>Текст новости</p>');
                    document.querySelectorAll('input').forEach( (el) => el.value = null)
                    document.querySelectorAll('#preview-img-input + label, #main-img-input + label').forEach( (el) => {
                        el.innerHTML = 'Нажмите, чтобы выбрать'
                    })
                }
            });
        })

    })
    .catch(error => {
        console.error(error);
    });


const listNews = async () => {
    const res = await fetch('/evo/news/list', {
        method: "GET",
    })

    const data = await res.json()



    data.forEach(function(item){

        document.querySelector("#news-list-wrapper").insertAdjacentHTML('beforeend', `
<div class="card mb-4" data-news-id="${item._id}">
    <div class="card-body">
        <div class="row">
            <div class="col-12 col-md-4">
                <img style="height: 160px; width: 100%; object-fit: cover" src="${serverURL}${item.previewImg}" alt="">
            </div>
            <div class="col-12 col-md-8">
                <h4 class="m-0">${item.title}</h4>
                <p>${item.content.slice(0, 150) + '...'}</p>
                <button class="btn btn-primary mr-3">Редактировать новость</button>
                <button class="btn btn-primary">Открыть новость на сайте</button>
            </div>
            
        </div>
        
    </div>
</div>
`);
    })
}


const createNewsItem = async (contentData) => {

    const request = async (formData, contentData, titleText) => {

        const res = await fetch('/evo/news/upload-photos', {method: "POST", body: formData})

        if (res.status === 200) {

            const resJSON = await res.json()

            console.log('RESPONSE', resJSON)

            const newsItemData = JSON.stringify({
                title: `${titleText}`,
                content: `${contentData}`,
                previewImg: `${resJSON[0].path}`,
                mainImg: `${resJSON[1].path}`,
            })

            console.log('newsItemData', newsItemData)

            return await fetch('/evo/news/add', {
                method: "POST",
                body: newsItemData,
                headers: {'Content-Type': "application/json"}
            })

        }

        else return false

    }

    const previewImg = document.querySelector('#preview-img-input').files[0]
    const mainImg = document.querySelector('#main-img-input').files[0]
    const titleText = document.querySelector('#title-input').value


    if ((previewImg !== undefined && mainImg !== undefined) && titleText) {

        const formData = new FormData();

        formData.append("preview-img", previewImg);
        formData.append("main-img", mainImg);

        const res = await request(formData, contentData, titleText);

        console.log('OTVET', res)

        if (res.status === 201) {
            Swal.fire({
                title: 'Новость опубликована',
                icon: 'success',
                confirmButtonText: 'Отлично'
            })
            return true
        }
        else {
            Swal.fire({
                title: 'Произошла ошибка :(',
                text: 'Обратитесь к одному из прекрасных разработчиков UPRO',
                icon: 'error',
                confirmButtonText: 'Ладно'
            })
            return false
        }

    }
    else {
        Swal.fire({
            title: 'Необходимо заполнить все поля и добавить оба изображения :(',
            // text: 'И добавить оба изображения',
            icon: 'error',
            confirmButtonText: 'Ок'
        })
        return false
    }

}


