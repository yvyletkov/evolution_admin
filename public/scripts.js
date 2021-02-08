console.log(ClassicEditor.builtinPlugins.map(plugin => plugin.pluginName))

ClassicEditor
    .create(document.querySelector('#editor'), {
        removePlugins: ['ImageUpload'],
        language: 'ru'
    })
    .then(editor => {

        editor.setData('<p>Текст новости</p>');

        document.querySelector('.submit-btn').addEventListener('click', () => {
            const contentData = editor.getData();
            console.log(contentData)
            sendNewsItem(contentData);
        })

    })
    .catch(error => {
        console.error(error);
    });


const sendNewsItem = (contentData) => {
    const img = document.querySelector('#image-upload-form input').files[0]

    // console.log('img', img)

    const formData = new FormData();

    formData.append("img", img);

    const request = async () => {
        const res = await fetch('/upload', {method: "POST", body: formData})
        const resJSON = await res.json()

        console.log('RESPONSE', resJSON)

        const newsItemData = JSON.stringify({
            title: 'testNewsItem',
            content: `${contentData}`,
            img: `${resJSON.path}`
        })

        console.log('newsItemData', newsItemData)

        const finalRes = await fetch('/', {
            method: "POST",
            body: newsItemData,
            headers: { 'Content-Type': "application/json" }
        })

    }

    request();

}


