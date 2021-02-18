module.exports = (eventList) => {

    let getDates = function(startDate, endDate) {
        let dates = [],
            currentDate = startDate,
            addDays = function(days) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    };

    let serializedList = []

    eventList.map( (item) => {

        if (item.startDate !== item.endDate){

            let dates = getDates(new Date(item.startDate), new Date(item.endDate));

            dates.map( (date) => serializedList = [
                ...serializedList,
                {...item._doc, date: date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)}

            ])

        }

        else {
            serializedList = [
                ...serializedList,
                item
            ]
        }

    })

    return serializedList;

}