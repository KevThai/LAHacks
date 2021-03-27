
import React, { Component } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
 
class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null
      }
   
  };
 
render() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
            <ToastContainer />
            <form method="post" action="#" id="#">
                  <div className="form-group files">
                    <input type="file" name="file" className="form-control" onChange={this.onChangeHandler}/>
                  </div>
                  <div className="col-md-6 pull-right">
                    <button width="100%" type="button" className="btn btn-info" onClick={this.fileUploadHandler}>Upload File</button>
                  </div>
              </form>
        </div>
      </div>
    </div>
  );
}
  onChangeHandler=event=>{
    var file = event.target.files[0];
    if(this.validateSize(event)){ 
  // if return true allow to setState
     this.setState({
      selectedFile: file
      });
 
    }
  }
  fileUploadHandler = () => {
    const data = new FormData()
    data.append('file', this.state.selectedFile)
    axios.post("http://localhost:3000", data)
      .then(res => { // then print response status
        toast.success('upload success')
      })
      .catch(err => { // then print response status
        toast.error('upload fail')
      })
 
  };
  validateSize=(event)=>{
      let file = event.target.files[0];
      let size = 1000000000;
      let err = '';
      if (file.size > size) {
      err = 'is too large, please pick a smaller file\n';
      toast.error(err);
      }
    return true
  };
}

export default App;