// let serverURL = "https://evo-dashboard.ml/"
let serverURL = "http://localhost:3333/";
let websiteURL = "https://evolutionsport.ru/new/"

window.addEventListener('load', () => {

    let slideout = new Slideout({
        'panel': document.getElementById('content'),
        'menu': document.getElementById('menu'),
        'padding': 256,
        'tolerance': 70
    });

    document.querySelector('.toggle-button').addEventListener('click', function () {
        slideout.toggle();
    });

})

pickmeup.defaults.locales['ru'] = {
    days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    daysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    daysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
};

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const loadCreateEventForm = async () => {

    document.querySelector('#preview-img-input').addEventListener('change', function (el) {
        let value = this.value.split('\\');
        let fileName = value[value.length - 1]
        console.log('value', this)
        el.target.nextSibling.nextElementSibling.innerHTML = fileName;
    })

    window.DATEPICKER = pickmeup('.range', {
        flat: true,
        mode: 'range',
        format: 'Y-m-d',
        locale: 'ru'
    });
    document.querySelector('.range').addEventListener('pickmeup-change', function (e) {
        console.log(e.detail.formatted_date); // New date according to current format
    })

    document.querySelector('#submit-btn').addEventListener('click', async () => {
        const res = await createEvent();

        if (res) {
            document.querySelectorAll('input, textarea').forEach( (el) => el.value = null)
            document.querySelectorAll('#preview-img-input + label, #main-img-input + label').forEach( (el) => {
                el.innerHTML = 'Нажмите, чтобы выбрать изображение'
            })
        }
    })


    const createEvent = async () => {

        const titleText = document.querySelector('#title-input').value
        const descriptionText = document.querySelector('#description-input').value
        const previewImg = document.querySelector('#preview-img-input').files[0]
        const link = document.querySelector('#link-input').value || '';
        const startDate = DATEPICKER.get_date(true)[0];
        const endDate = DATEPICKER.get_date(true)[1];

        if ((previewImg !== undefined) && titleText && descriptionText && startDate) { //нужно еще сделать проверку на ввод даты b

            const previewImgFormData = new FormData();
            previewImgFormData.append("preview-img", previewImg);
            const previewImgUploadRes = await fetch('/evo/events/upload-photos', {method: "POST", body: previewImgFormData})

            if (previewImgUploadRes.status === 200) {

                const previewImgData = await previewImgUploadRes.json()

                const eventData = JSON.stringify({
                    startDate: `${startDate}`,
                    endDate: `${endDate}`,
                    value: `${titleText}`,
                    desc: `${descriptionText}`,
                    img: `${previewImgData[0].path}`,
                    link: link
                })

                console.log('eventData', eventData)

                const res = await fetch('/evo/events/add', {
                    method: "POST",
                    body: eventData,
                    headers: {'Content-Type': "application/json"}
                })

                if (res.status === 201) {
                    Swal.fire({
                        title: 'Событие опубликовано',
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
                title: 'Необходимо заполнить все поля и добавить изображение :(',
                icon: 'error',
                confirmButtonText: 'Ок'
            })
            return false
        }

    }


}

const listEvents = async () => {

    const res = await fetch('/evo/events/list', {
        method: "GET",
    })

    const data = await res.json()

    data.forEach(function(item){

        document.querySelector("#events-list-wrapper").insertAdjacentHTML('beforeend', `
        <div class="card mb-4" data-news-id="${item._id}" >
            <div class="card-body" ${item.inactive === true ? 'style="opacity: 0.5"' : ''}>
                <div class="row">` +
                    // <div style="position:absolute;top:20px;right: 30px;font-size: 13px;color:#a0a0a0">
                    //     ${item.inactive === true ? 'Событие завершилось' : 'Событие актально'}
                    // </div>
                    `<div class="col-12 col-md-4 mb-4 mb-md-0 mt-4 mt-md-0">
                        <img style="height: 185px; width: 100%; object-fit: cover" src="${serverURL}${item.img}" alt="">
                    </div>
                    <div class="col-12 col-md-8">
                        <h4 class="m-0 mt-4">${item.value}</h4>
                        <p class="mt-4">${item.desc ? item.desc.slice(0, 130) + '...' : 'Описание отсутствует'}</p>
                        <div class="btn-group" style="flex-wrap: wrap" role="group" aria-label="Basic example">
                            <a href="/evo/news/edit?id=${item._id}" class="btn btn-outline-primary mb-3 mb-lg-0 ml-lg-0">Редактировать</a>
                            ${item.link && 
            `<a href="${item.link}" class="btn btn-outline-primary mb-3 mb-lg-0">Прикрепленная ссылка</a>`}
                            ${item.inactive === true ?
            `<span data-news-id="${item._id}" class="btn btn-outline-primary float-lg-right activate-news-item-btn mb-3 mb-lg-0">Отобразить на сайте</span>` :
            `<span data-news-id="${item._id}" class="btn btn-outline-primary float-lg-right deactivate-news-item-btn mb-3 mb-lg-0">Скрыть с сайта</span>`}
                            <span data-news-id="${item._id}" class="btn btn-outline-danger float-lg-right d-block d-md-inline delete-news-item-btn mb-3 mb-lg-0 mr-lg-0">Удалить</span>
                        </div>

                    </div>
                    
                </div>
                
            </div>
        </div>
        `);
    })

    document.querySelectorAll('.delete-news-item-btn').forEach( el => el.addEventListener('click', deleteEvent) )
    document.querySelectorAll('.activate-news-item-btn').forEach( el => el.addEventListener('click', activateEvent) )
    document.querySelectorAll('.deactivate-news-item-btn').forEach( el => el.addEventListener('click', deactivateEvent) )

}

const deleteEvent = async (e) => {

    Swal.fire({
        title: 'Точно удалить событие?',
        text: 'Восстановить его будет невозможно',
        icon: 'warning',
        confirmButtonText: 'Удалить',
        showCancelButton: true,
        cancelButtonText: 'Отмена'
    }).then( async (result) => {
        if (result.isConfirmed) {

            const id = e.target.dataset.newsId
            const res = await fetch('/evo/events/delete', {
                method: "DELETE",
                body: JSON.stringify({
                    id: `${id}`
                }),
                headers: {'Content-Type': "application/json"}
            })
            if (res.status === 200) {
                Swal.fire({
                    title: 'Событие успешно удалено',
                    icon: 'success',
                    confirmButtonText: 'Ок'
                })
                    .then( () => location.reload())
            }
            let data = await res.json();

        }
    })

}

const activateEvent = async (e) => {
    const id = e.target.dataset.newsId

    let requestBody = {
        id: id,
        update: {
            inactive: false,
        }
    }

    const res = await fetch('/evo/events/update', {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': "application/json"}
    })

    if (res.status === 200) {
        Swal.fire({
            title: 'Событие теперь видно на сайте',
            icon: 'success',
            confirmButtonText: 'Ок'
        })
            .then( () => location.reload())
    }
    else Swal.fire({
        title: 'Ошибка при попытке вернуть событие на сайт',
        icon: 'error',
        confirmButtonText: 'Ок'
    })

}

const deactivateEvent = async (e) => {
    const id = e.target.dataset.newsId

    let requestBody = {
        id: id,
        update: {
            inactive: true,
        }
    }

    const res = await fetch('/evo/events/update', {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': "application/json"}
    })

    if (res.status === 200) {
        Swal.fire({
            title: 'Событие успешно скрыто с сайта',
            icon: 'success',
            confirmButtonText: 'Ок'
        })
            .then( () => location.reload())
    }
    else Swal.fire({
        title: 'Ошибка при попытке скрыть событие',
        icon: 'error',
        confirmButtonText: 'Ок'
    })

}

