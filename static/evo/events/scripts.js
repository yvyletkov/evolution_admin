
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

function cutTags(str) {
    const regex = /<[^>]*>/g;
    return str.replace(regex, "");
}

window.addEventListener('load', function () {

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

})

const loadCreateEventForm = async () => {

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

        if ((previewImg !== undefined) && titleText && descriptionText) { //нужно еще сделать проверку на ввод даты b

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
                title: 'Необходимо заполнить все поля и добавить оба изображения :(',
                // text: 'И добавить оба изображения',
                icon: 'error',
                confirmButtonText: 'Ок'
            })
            return false
        }

    }


}
