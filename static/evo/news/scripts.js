let serverURL = "http://localhost:3000/"
var EDITOR;

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.addEventListener('load', async () => {

    EDITOR = await ClassicEditor
        .create(document.querySelector('#editor'), {
            removePlugins: ['ImageUpload'],
            language: 'ru',
            height: '300px'
        })

    EDITOR.setData('<p>Текст новости</p>');

    document.querySelectorAll('#preview-img-input, #main-img-input').forEach((el) => el.addEventListener('change', function (el) {
            let value = this.value.split('\\');
            let fileName = value[value.length - 1]
            console.log('value', this)
            el.target.nextSibling.nextElementSibling.innerHTML = fileName;
        })
    )

    document.querySelector('#update-news-item-btn').addEventListener('click', updateNewsItem)

})


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
                        <a href="/evo/news/edit?id=${item._id}" class="btn btn-primary mr-3">Редактировать новость</a>
                        <a href="#" class="btn btn-outline-primary mr-5">Открыть новость на сайте</a>
                        <span data-news-id="${item._id}" class="btn btn-danger float-right delete-news-item-btn">Удалить новость</span>
                    </div>
                    
                </div>
                
            </div>
        </div>
        `);
    })

    document.querySelectorAll('.delete-news-item-btn').forEach( el => el.addEventListener('click', deleteNewsItem) )

}

const loadCreateNewsForm = async () => {

    document.querySelector('#submit-btn').addEventListener('click', async () => {
        const res = await createNewsItem();

        if (res) {
            EDITOR.setData('<p>Текст новости</p>');
            document.querySelectorAll('input').forEach( (el) => el.value = null)
            document.querySelectorAll('#preview-img-input + label, #main-img-input + label').forEach( (el) => {
                el.innerHTML = 'Нажмите, чтобы выбрать'
            })
        }
    })


    const createNewsItem = async () => {

        const contentData = EDITOR.getData();
        const titleText = document.querySelector('#title-input').value
        const previewImg = document.querySelector('#preview-img-input').files[0]
        const mainImg = document.querySelector('#main-img-input').files[0]

        if ((previewImg !== undefined && mainImg !== undefined) && titleText) {

            const previewImgFormData = new FormData();
            previewImgFormData.append("preview-img", previewImg);
            const previewImgUploadRes = await fetch('/evo/news/upload-photos', {method: "POST", body: previewImgFormData})

            const mainImgFormData = new FormData();
            mainImgFormData.append("main-img", mainImg);
            const mainImgUploadRes = await fetch('/evo/news/upload-photos', {method: "POST", body: mainImgFormData})


            if ((previewImgUploadRes.status === 200) && (mainImgUploadRes.status === 200)) {

                const previewImgData = await previewImgUploadRes.json()
                const mainImgData = await mainImgUploadRes.json()

                const newsItemData = JSON.stringify({
                    title: `${titleText}`,
                    content: `${contentData}`,
                    previewImg: `${previewImgData[0].path}`,
                    mainImg: `${mainImgData[0].path}`,
                })

                console.log('newsItemData', newsItemData)

                const res = await fetch('/evo/news/add', {
                    method: "POST",
                    body: newsItemData,
                    headers: {'Content-Type': "application/json"}
                })

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
                    title: 'Произошла ошибка при отправке изображений :(',
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


}

const fillInEditForm = async () => {
    const id = getParameterByName('id')
    const res = await fetch('/evo/news/get', {
        method: "POST",
        body: JSON.stringify({
            id: `${id}`
        }),
        headers: {'Content-Type': "application/json"}
    })
    let data = await res.json();
    console.log(data.title)

    document.querySelector('#title-input').value = data.title;
    EDITOR.setData(data.content);

    document.querySelector('#main-img').src = `${serverURL}${data.mainImg}`
    document.querySelector('#preview-img').src = `${serverURL}${data.previewImg}`

}

const updateNewsItem = async () => {

    const contentData = EDITOR.getData();
    const titleText = document.querySelector('#title-input').value
    const previewImg = document.querySelector('#preview-img-input').files[0]
    const mainImg = document.querySelector('#main-img-input').files[0]

    if ( titleText) {

        let previewImageUploadRes;
        let mainImageUploadRes;

        if(previewImg) {
            const formData = new FormData();
            formData.append("preview-img", previewImg);
            previewImageUploadRes = await fetch('/evo/news/upload-photos', {method: "POST", body: formData})
        }
        if(mainImg) {
            const formData = new FormData();
            formData.append("main-img", mainImg);
            mainImageUploadRes = await fetch('/evo/news/upload-photos', {method: "POST", body: formData})
        }

        console.log('preview', previewImageUploadRes)
        console.log('main', mainImageUploadRes)

        if ( (previewImg && previewImageUploadRes.status !== 200) || (mainImageUploadRes && mainImageUploadRes.status !== 200) ) {

            Swal.fire({
                title: 'Произошла ошибка при отправке изображений :(',
                text: 'Обратитесь к одному из прекрасных разработчиков UPRO',
                icon: 'error',
                confirmButtonText: 'Ладно'
            })

        }
        else {
            let previewImageData, mainImageData;

            let requestBody = {
                id: getParameterByName('id'),
                update: {
                    title: `${titleText}`,
                    content: `${contentData}`,
                }
            }

            if (previewImg) {
                previewImageData = await previewImageUploadRes.json();
                requestBody.update = {
                    ...requestBody.update,
                    previewImg: `${previewImageData[0].path}`,
                }
            }

            if (mainImg) {
                mainImageData = await mainImageUploadRes.json();
                requestBody.update = {
                    ...requestBody.update,
                    mainImg: `${mainImageData[0].path}`,
                }
            }

            console.log('IMAGES DATA', previewImageData, mainImageData);

            const res = await fetch('/evo/news/update', {
                method: "POST",
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': "application/json"}
            })

            if (res.status === 200) {
                Swal.fire({
                    title: 'Новость обновлена',
                    icon: 'success',
                    confirmButtonText: 'Отлично',
                }).then( () => location.reload())
            }
            else {
                Swal.fire({
                    title: 'Произошла ошибка :(',
                    text: 'Обратитесь к одному из прекрасных разработчиков UPRO',
                    icon: 'error',
                    confirmButtonText: 'Ладно',
                })
            }

        }


    }
    else {
        Swal.fire({
            title: 'Необходимо указать заголовок новости',
            // text: 'И добавить оба изображения',
            icon: 'error',
            confirmButtonText: 'Ок'
        })
    }

}


const deleteNewsItem = async (e) => {

    console.log(e.target.dataset.newsId)

    const id = e.target.dataset.newsId

    const res = await fetch('/evo/news/delete', {
        method: "DELETE",
        body: JSON.stringify({
            id: `${id}`
        }),
        headers: {'Content-Type': "application/json"}
    })

    if (res.status === 200) {
        Swal.fire({
            title: 'Новость успешно удалена',
            // text: 'И добавить оба изображения',
            icon: 'success',
            confirmButtonText: 'Ок'
        })
            .then( () => location.reload())
    }

    let data = await res.json();



}
