import React, { Component } from 'react';
import { MdInsertDriveFile } from 'react-icons/md';
import Logo from '../../components/Logo/logo';
import './style.css'
import api from '../../services/api';

import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Dropzone from 'react-dropzone'
import Socket from 'socket.io-client';

export class Box extends Component {

  state = { box: {} }

  async componentDidMount() {
    this.subscribeToNewFiles();
    const box = this.props.match.params.id;
    const response = await api.get(`boxes/${box}`);

    this.setState({ box: response.data })
  }

  subscribeToNewFiles = () => {
    const box = this.props.match.params.id;
    const io = Socket('https://dropBox-server-clone.herokuapp.com');

    io.emit('connectRoom', box);
    io.on('file', data => {
      this.setState({
        box: {
          ...this.state.box,
          files: [data, ...this.state.box.files]
        }
      })
    })
  };

  handleUpload = (files) => {
    files.forEach(file => {
      const data = new FormData();
      const box = this.props.match.params.id;


      data.append('file', file)

      api.post(`boxes/${box}/files`, data);
    });
  }

  render() {
    const { box } = this.state;

    return (
      <div id="box-container">
        <header>
          <Logo />
          <h1>{box.title}</h1>
        </header>

        <Dropzone onDropAccepted={this.handleUpload}>
          {({ getRootProps, getInputProps }) => (
            <div className="upload" {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Arraste arquivos ou clique aqui</p>
            </div>
          )}
        </Dropzone>

        <ul>
          {
            box.files && box.files.map((file, index) => {
              return (
                <li key={index}>
                  <a className="fileInfo" href={file.url} target="_blank">
                    <MdInsertDriveFile size={24} color="#A5Cfff" />
                    <strong>{file.title}</strong>
                  </a>
                  <span>
                    há{" "}
                    {distanceInWords(file.createdAt, new Date(), {
                      locale: pt
                    })}
                  </span>
                </li>)
            })
          }
        </ul>
      </div>
    )
  }
}

export default Box

