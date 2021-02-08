console.log(ClassicEditor.builtinPlugins.map( plugin => plugin.pluginName ))

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        removePlugins: [ 'ImageUpload' ],
        language: 'ru'
    } )
    .then( editor => {

        editor.setData( '<p>Текст новости</p>' );

        document.querySelector( '.create-news-btn' ).addEventListener('click', () => {
            const contentData = editor.getData();
            console.log(contentData)

        })

    } )
    .catch( error => {
        console.error( error );
    } );