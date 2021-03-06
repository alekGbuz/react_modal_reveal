
var ELEMENTS = [
    {id:0, name:'TEXT BLOCK', description:'choose by click...', click:'false',add_page:'false',user_title:''},
    {id:1, name:'BUTTON', description:'choose by click...', click:'false',add_page:'false',user_title:''},
    {id:2, name : 'VIDEO', description: 'choose by click...',click:'false',add_page:'false',user_title:''}
];
var constants = {
 ADD_ELEMENT:"ADD_ELEMENT",
 FIND_ELEMENT:"FIND_ELEMENT",
 ADD_ELEMENT_TO_PAGE:"ADD_ELEMENT_TO_PAGE",
 CHANGE_ELEMENT_TITLE:"CHANGE_ELEMENT_TITLE"
};

var ElementStore = Fluxxor.createStore({
    actions: {
    "ADD_ELEMENT": "onAddElement",
    "FIND_ELEMENT":"onFindElements",
    "ADD_ELEMENT_TO_PAGE":"onAddToPage",
    "CHANGE_ELEMENT_TITLE":"onChangeElementTitle"
  },

   initialize:function(){
        this.elements = ELEMENTS;
        this.search = "";
        this.user_title="";
    },

   onChangeElementTitle: function(payload){
       this.user_title=payload.text;
       console.log(this.user_title);
       this.emit("change");

   },

   onAddElement: function(payload){
       var id = payload.id;
       this.elements[id].click = 'true';
       this.emit("change");

    },

   onFindElements:function(payload){
        var text = payload.text;
        this.search = text;
        console.log(this.search);
        this.emit("change");
    },


   onAddToPage: function(){
     var last_element=-1;
     for (var i=0;i<this.elements.length;i++ ){
         if (this.elements[i].click=='true'){
            last_element = i;
            this.elements[i].click='false';
         }

     }
     if(last_element>-1){
        this.elements[last_element].add_page='true';
        this.elements[last_element].user_title=this.user_title;
     }
     this.emit("change");
   },

    getState: function() {
        return { elements: this.elements,search: this.search};

    }

});

var actions = {
   addElement: function(id){
        this.dispatch(constants.ADD_ELEMENT,{id:id});
   },

   addToPage: function(){
       this.dispatch(constants.ADD_ELEMENT_TO_PAGE,{});

   },

   findElements: function(text){
        this.dispatch(constants.FIND_ELEMENT,{text:text});
   },

   changeElementTitle: function(text){
       this.dispatch(constants.CHANGE_ELEMENT_TITLE,{text:text});
   }
};

var stores = {
    ElementStore: new ElementStore()

};

var flux = new Fluxxor.Flux(stores, actions);

flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;



var Application = React.createClass({
    mixins:[FluxMixin,StoreWatchMixin("ElementStore")],


    getStateFromFlux: function(){
        var flux = this.getFlux();
        return flux.store("ElementStore").getState();
    },

    handleAddToPage: function(){
        return  this.getFlux().actions.addToPage();

    },

    render: function() {
    var elements = this.state.elements;
    var search = this.state.search;

    return (
      <div>

        <span>{ <ElementFindBar />}</span>

        <ul>
          {Object.keys(elements).map(function(id) {
            if(search.length>0 && elements[id].description.toLowerCase().indexOf(search.toLowerCase())==-1 && elements[id].name.toLowerCase().indexOf(search.toLowerCase())==-1) return;
            return <li  key={id}><ElementItem element={elements[id]} /></li>;

          })}
        </ul>
        <div>{< ElementUserTitle />}</div>
        <button className="close-reveal-modal-react" onClick={this.handleAddToPage}>Add to Page</button>
      </div>
    );
  }
});

var ElementUserTitle = React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return { userElementTitle: "" };
    },

    handleElementTitleChange: function(e){
        this.state.userElementTitle = e.target.value;
        this.getFlux().actions.changeElementTitle(this.state.userElementTitle);
    },
    render: function(){
        return (
            <input type="text" onChange={this.handleElementTitleChange} value={this.state.userElementTitle} size="30" placeholder="Give Element Name..."/>
        )
    }
});

var ElementFindBar = React.createClass({
    mixins:[FluxMixin],

    getInitialState: function() {
        return { searchElementText: "" };
    },


    handleTextChange: function(e) {
         this.state.searchElementText= e.target.value;
         this.getFlux().actions.findElements(this.state.searchElementText);
    },

    render: function(){
        return (

             <input type="text" size="30" placeholder="Search Through Element Types..."
                value={this.state.searchElementText}
                 onChange={this.handleTextChange} />
        )
    }
});

var ElementItemResultChoose = React.createClass({
     mixins:[FluxMixin,StoreWatchMixin("ElementStore")],

    getStateFromFlux: function(){
        var flux = this.getFlux();
        return flux.store("ElementStore").getState();
    },

    render: function() {
    var elements = this.state.elements;
    return (
      <div>
        <ul>
          {Object.keys(elements).map(function(id) {
            if(elements[id].add_page!='true') return;
            return <li  key={id}><ElementItemChoose element={elements[id]} /></li>;

          })}
        </ul>

      </div>
    );
  }
});

var ElementItemChoose = React.createClass({
    mixins:[FluxMixin],

    render: function(){
         return <span>{this.props.element.name} / {this.props.element.description}/ {this.props.element.user_title} </span>

   }
});

var ElementItem = React.createClass({
    mixins: [FluxMixin],
    propTypes: {
    element: React.PropTypes.object.isRequired
    },

    handleClick: function() {

      this.getFlux().actions.addElement(this.props.element.id);

    },
    render: function(){
        return (
        <div>
                <span onClick={this.handleClick}>{this.props.element.name} / {this.props.element.description} / {this.props.element.show}</span>

        </div>
        )

    }
});


React.render(<Application flux={flux} />, document.getElementById("app"));
React.render(<ElementItemResultChoose flux={flux} />, document.getElementById("result"));