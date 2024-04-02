import { api, LightningElement, track,wire } from 'lwc';
import SearchBookfromLibrary from '@salesforce/apex/SearchBookFromLibrary.getBookByName';
import OpenLibraryURL from '@salesforce/label/c.OpenLibraryURL';

export default class SearchBook extends LightningElement {
	@track bookResults = [];
	@track SearchText;
    @track BooksAvailable;
    @track isModalProcessing;
    @track OpenLibraryURL;
    @track pageSizeOptions = [10, 25, 50, 75, 100]; //Page size options
    @track columns = []; //columns information available in the data table
    @track records =[];
    @track totalRecords = 0; //Total no.of records
    @track pageSize; //No.of records to be displayed per page
    @track totalPages; //Total no.of pages
    @track pageNumber = 1; //Page number    
    @track recordsToDisplay = []; //Records to be displayed on the page
    
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }

    async connectedCallback() {

        try{
            this.isModalProcessing = false;
            this.BooksAvailable =false;
            this.OpenLibraryURL = OpenLibraryURL;
            this.columns = [{
                label: 'Book Title',
                fieldName: 'Title'
            },
            {
                label: 'Author',
                fieldName: 'Author'
            },
            {
                label: 'Link to Open Library Page',
                fieldName: 'Link',
                type: 'url',
                typeAttributes:{
                    label:'Go to Book Page',
                    target: '_blank'
                }
            }
        ];
        }catch(err){
            console.log("connectedCallback : " + err + ", stack : " + err.stack);
        }
    }
    handleInputChange(event){
        try{
            let fieldValue = event.target.value;
            //console.log('this.fieldValue::'+fieldValue);
            if(this.isFieldEmpty(fieldValue))
            {
                alert("Please enter the book name");
                return;
            }
            var strSearch = fieldValue.replaceAll(' ', '+');
            //console.log('this.strSearch::'+strSearch);
            let requestParam = {};
            requestParam.SearchText = strSearch;
            //console.log('requestParam::'+JSON.stringify(requestParam));
            //get Book list based on name
            this.isModalProcessing = true;
            SearchBookfromLibrary(requestParam).then(result => {
                if(result && result.Success){
                    let Response = JSON.parse(result.Success);
                    this.bookResults = Response;
                    //console.log("Response Response : " + JSON.stringify(Response));
                    if(!this.isFieldEmpty(this.bookResults.docs)){
                        this.bookResults.docs.forEach((element) => {
                            var record ={};
                            //var strtitle = element.title.replaceAll(' ', '+'); 
                            record.Title = element.title;

                            if(!this.isListEmpty(element.author_name))
                            record.Author = element.author_name[0];

                            record.Link = "https://openlibrary.org"+element.key; //URL link
                            this.records.push(record);
                        });    
                    }else{
                        alert('No records found');
                        this.isModalProcessing = false;
                        return;
                    }
                    //console.log("Response+"+Response.docs[0].author_name);
                    //console.log("Response this.records : " + JSON.stringify(this.records));
                    //console.log("link=="+JSON.stringify(this.records[0].Link));
                    //console.log("this.records.length : " + this.records.length);

                    this.BooksAvailable = true;
                    this.totalRecords = this.records.length; // update total records count                 
                    this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                    this.paginationHelper(); 
                    this.isModalProcessing = false;
                } 
                this.isModalProcessing = false;
            });
        }catch(err){
            console.log("handleInputChange : " + err + ", stack : " + err.stack);
        }
        //this.isModalProcessing = false;
    }
    isFieldEmpty(fieldValue){
        if(fieldValue == undefined || fieldValue == null || fieldValue == ""){
            return true;
        }
        return false;
    }
    isListEmpty(list){
        if(list == undefined || list == null || list.length == 0){
            return true;
        }
        return false;
    } 
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    // JS function to handel pagination logic 
    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.records[i]);
        }
    }
    
}