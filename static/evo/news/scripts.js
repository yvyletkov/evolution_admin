let serverURL = "https://evo-dashboard.ml/"
// let serverURL = "http://localhost:3333/";
let websiteURL = "https://evolutionsport.ru/new/"

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function cutTags(str) {
    const regex = /<[^>]*>/g;
    return str.replace(regex, "");
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
        <div class="card mb-4" data-news-id="${item._id}" >
            <div class="card-body" ${item.unactive === 'true' ? 'style="opacity: 0.5"' : ''}>
                <div class="row">
                    <div style="position:absolute;top:20px;right: 30px;font-size: 13px;color:#a0a0a0">
                        ${item.unactive === 'true' ? 'Новость скрыта' : 'Новость активна'}
                    </div>
                    <div class="col-12 col-md-4 mb-4 mb-md-0 mt-4 mt-md-0">
                        <img style="height: 100%; width: 100%; object-fit: cover" src="${serverURL}${item.previewImg}" alt="">
                    </div>
                    <div class="col-12 col-md-8">
                        <h4 class="m-0 mt-4">${item.title}</h4>
                        <p class="mt-4">${item.content ? (cutTags(item.content).slice(0, 200) + '...') : item.link}</p>
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <a href="/evo/news/edit?id=${item._id}" class="btn btn-outline-primary mb-3 mb-lg-0 ml-lg-0">Редактировать</a>
                            <a href="${websiteURL}news.html?id=${item._id}" class="btn btn-outline-primary mb-3 mb-lg-0">Открыть на сайте</a>
                            ${item.unactive === 'true' ?
                                `<span data-news-id="${item._id}" class="btn btn-outline-primary float-lg-right activate-news-item-btn mb-3 mb-lg-0">Активировать</span>` :
                                `<span data-news-id="${item._id}" class="btn btn-outline-primary float-lg-right deactivate-news-item-btn mb-3 mb-lg-0">Скрыть</span>`}
                            <span data-news-id="${item._id}" class="btn btn-outline-danger float-lg-right d-block d-md-inline delete-news-item-btn mb-3 mb-lg-0 mr-lg-0">Удалить</span>
                        </div>

                    </div>
                    
                </div>
                
            </div>
        </div>
        `);
    })

    document.querySelectorAll('.delete-news-item-btn').forEach( el => el.addEventListener('click', deleteNewsItem) )
    document.querySelectorAll('.activate-news-item-btn').forEach( el => el.addEventListener('click', activateNewsItem) )
    document.querySelectorAll('.deactivate-news-item-btn').forEach( el => el.addEventListener('click', deactivateNewsItem) )

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
        const link = document.querySelector('#link-input').value || '';

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
                    link: link
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
    document.querySelector('#link-input').value = data.link || "";
    EDITOR.setData(data.content);

    document.querySelector('#main-img').src = `${serverURL}${data.mainImg}`
    document.querySelector('#preview-img').src = `${serverURL}${data.previewImg}`

}

const updateNewsItem = async () => {

    const contentData = EDITOR.getData();
    const titleText = document.querySelector('#title-input').value
    const link = document.querySelector('#link-input').value
    const previewImg = document.querySelector('#preview-img-input').files[0]
    const mainImg = document.querySelector('#main-img-input').files[0]

    if (titleText) {

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
                    link: link || ''
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

    Swal.fire({
        title: 'Точно удалить новость?',
        text: 'Восстановить ее будет невозможно',
        icon: 'warning',
        confirmButtonText: 'Удалить',
        showCancelButton: true,
        cancelButtonText: 'Отмена'
    }).then( async (result) => {
        if (result.isConfirmed) {

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
    })

}

const activateNewsItem = async (e) => {
    const id = e.target.dataset.newsId

    let requestBody = {
        id: id,
        update: {
            unactive: `false`,
        }
    }

    const res = await fetch('/evo/news/update', {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': "application/json"}
    })

    if (res.status === 200) {
        Swal.fire({
            title: 'Новость успешно активирована',
            // text: 'И добавить оба изображения',
            icon: 'success',
            confirmButtonText: 'Ок'
        })
            .then( () => location.reload())
    }
    else Swal.fire({
        title: 'Ошибка при попытке активировать новость',
        icon: 'error',
        confirmButtonText: 'Ок'
    })

}

const deactivateNewsItem = async (e) => {
    const id = e.target.dataset.newsId

    let requestBody = {
        id: id,
        update: {
            unactive: `true`,
        }
    }

    const res = await fetch('/evo/news/update', {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': "application/json"}
    })

    if (res.status === 200) {
        Swal.fire({
            title: 'Новость успешно скрыта с сайта',
            icon: 'success',
            confirmButtonText: 'Ок'
        })
            .then( () => location.reload())
    }
    else Swal.fire({
        title: 'Ошибка при попытке скрыть новость',
        icon: 'error',
        confirmButtonText: 'Ок'
    })

}
