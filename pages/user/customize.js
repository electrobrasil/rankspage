import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import api from '../../services/api';
import { 
    FaArrowRight, 
    FaLongArrowAltLeft, 
    FaLongArrowAltRight, 
    FaFileImage, 
    FaTimes,
    FaSave
} from 'react-icons/fa';

export default function Customize(){
    const [firstime, setFirstTime]          = useState('');
    const [labelOpen, setLabelOpen]         = useState('');
    const [profileBg, setProfileBg]         = useState('');
    const [profilePhoto, setProfilePhoto]   = useState('');
    const [configId, setConfigId]           = useState('');
    
    useEffect(() => {
        const cacheStorage = localStorage.getItem('configs');

        if(!cacheStorage) 
            setFirstTime('active');
        else
            document.querySelector('.init__display').classList.remove('active');
    }, []);

    function handleSave(){
        const InitDisplay = document.querySelector('.init__display');

        InitDisplay.classList.remove('active');
        localStorage.setItem('configs', true)
        setFirstTime('');
    }

    function openDialog(event){
        const { target } = event;
        const dialogLabel = target.getAttribute('data-label');
        const uploadDialog = document.querySelector('.upload__box');

        if(!uploadDialog.classList.contains('active')){
            setLabelOpen(dialogLabel);
            target.classList.add('active');
            uploadDialog.setAttribute('label', dialogLabel);
            uploadDialog.classList.add('active')
        }
    }

    function validImage(file){
        const mime_types = ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'];

        if(mime_types.indexOf(file.type) == -1)
            return false;

        return true;
    }

    function sendImageToImgur(file){
        return new Promise(async (resolve, reject) => {
            const readFile = new FileReader();
            readFile.readAsDataURL(file);
            readFile.onload = function(){
                const readResult = this.result.substr((this.result.search(/base64,/)+7));
                
                /**
                * @params Client-ID need a valid token based on imgur.com API
                * check this documentation in https://apidocs.imgur.com/
                */
                axios({
                    method: 'POST',
                    url: 'https://api.imgur.com/3/image',
                    headers: {
                        Authorization: 'Client-ID YOUR-APPLICATION-ID',
                    },
                    data: {
                        image: readResult,
                    }
                })
                .then(response => resolve(response))
                .catch(error => reject(error));
            }
        });
    }

    function dispatchImage(file){
        const validateImage = validImage(file);

        if(validateImage){
            document.querySelector('.upload__box .__content .drag__area .__text').textContent = 'Aguarde...';

            sendImageToImgur(file).then(response => {
                let displayLabelName = document.querySelector('.upload__box').getAttribute('label');

                document.querySelector(`[data-label="${displayLabelName}"]`).classList.remove('active');
                document.querySelector('.upload__box').removeAttribute('label');
                document.querySelector('.upload__box').classList.remove('active');
                document.querySelector('.upload__box .__content .drag__area .__text').textContent = 'ARRASTE A IMAGEM ATÉ AQUI';

                switch(labelOpen){
                    case 'profile__bg':
                        setProfileBg(response.data.data.link);
                        document.querySelector('.user__header').setAttribute(
                            'style',
                            `background: url(${response.data.data.link}) center no-repeat;`
                        );
                        break;
                    case 'profile__img':
                        setProfilePhoto(response.data.data.link);
                        document.querySelector('.user__photo').setAttribute(
                            'style',
                            `background: url(${response.data.data.link}) center no-repeat;`
                        );
                        break;
                }
                
                setLabelOpen('');
            });
        }
    }

    function handleSendImage(e){
        const saveButton = document.querySelector('.user__save');
        const dataLink   = (e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]);

        if(!saveButton.classList.contains('active')) saveButton.classList.add('active');

        dispatchImage(dataLink);
    }

    function handleSaveData(){
        const fileData = {
            bg: profileBg,
            image: profilePhoto
        }

        const saveButton = document.querySelector('.user__save');

        saveButton.classList.add('loading');

        api.post('/create/config', fileData).then(response => {
            const { data } = response;

            saveButton.classList.remove('loading');

            if(data.status){
                setConfigId(data.id);
                document.querySelector('.cid__box').classList.add('active');
            }
        });
    }

    return (
        <div className="ranks__container">
            <Head>
                <title>Personalização de perfil - Radio Brasil</title>
            </Head>
            <div className="custom__info">
                <h1>Personalização de perfil</h1>
                <p>Selecione o elemento que você deseja alterar ou <strong onClick={() => setFirstTime('active')}>clique aqui</strong> para ver o tutorial</p>
            </div>
            <header className="user__header">
                <div className="select__bg user" data-label="profile__bg" onClick={event => openDialog(event)}></div>
                <div className="user__information">
                    <div className="user__photo" data-label="profile__img" onClick={event => openDialog(event)}></div>
                    <div className="user__info">
                        <div className="loader__bar name"></div>
                        <div className="loader__bar time"></div>
                        <div className="loader__bar love"></div>
                    </div>
                </div>
                <ul className="user__navigator">
                    <div className="__item"></div>
                    <div className="__item"></div>
                    <div className="__item"></div>
                </ul>
            </header>
            <main className="user__save">
                <div className="save__button" onClick={e => handleSaveData(e)}>
                    <div className="save__loader"></div>
                    <div className="__content">
                        <FaSave style={{marginRight: '6px', verticalAlign: 'text-top', position: 'relative', top:'1px'}}/>
                        Salvar dados
                    </div>
                </div>
            </main>
            <footer>
                <div className="footer__buttons">
                    <Link href="/"><a className="to__room back"><FaLongArrowAltLeft/><p>Início</p></a></Link>
                    <a href="https://plug.dj/electro-brasil-19" target="_blank" className="to__room"><p>Ir para a sala</p><FaLongArrowAltRight></FaLongArrowAltRight></a>
                </div>
                <p className="creator__credits">Made with <i className="rks__icon rks-love"></i> by <a href="https://github.com/eljonathas" target="_blank">TheMars</a></p>
            </footer>
            <div className="cid__box">
                <div className="__content">
                    <h3 className="__title">Seu arquivo de configuração foi gerado</h3>
                    <p className="__description">Para aplicar suas alterações, basta ir até o chat da sala e digitar <strong>!img e o token gerado abaixo</strong>. Saiba que este arquivo é válido por 5 minutos.</p>
                    <label className="id__display">
                        {configId}
                    </label>
                    <div className="__footer">
                        Já terminou? Você pode <a href="https://plug.dj/electro-brasil-19" target="_blank">ir para a sala</a> ou <strong onClick={() => document.querySelector('.cid__box').classList.remove('active')}>continuar editando</strong>.
                    </div>
                </div>
            </div>
            <div className="upload__box">
                <div className="__content">
                    <div 
                        className="close__button" 
                        onClick={() => { 
                            let displayLabelName = document.querySelector('.upload__box').getAttribute('label');

                            document.querySelector(`[data-label="${displayLabelName}"]`).classList.remove('active');

                            setLabelOpen('');
                            document.querySelector('.upload__box').removeAttribute('label');
                            document.querySelector('.upload__box').classList.remove('active');
                        }}
                    ><FaTimes size={20}/></div>
                    <header 
                        className="drag__area" 
                        onDragEnter={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            e.target.classList.add('active')
                            
                        }} 
                        onDragLeave={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            e.target.classList.remove('active')
                        }}
                        onDragEnd={e => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onDragExit={e => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onDragOver={e => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onDrop={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleSendImage(e);
                        }}
                    >
                        <p className="__text">ARRASTE A IMAGEM ATÉ AQUI</p>
                    </header>
                    <main className="options__area">
                        <p>Ou se você preferir</p>
                        <label>
                            <input 
                                className="send__input" 
                                type="file" 
                                name="send__file" 
                                onChange={e => handleSendImage(e)}
                            /> 
                            <FaFileImage style={{marginRight: '4px', verticalAlign: 'text-top'}}/>
                            Enviar uma imagem
                        </label>
                    </main>
                </div>
            </div>
            <div className={`init__display ${firstime}`}>
                <div className="__content">
                    <header>
                        <h1 className="__title">Passos iniciais para a customização do perfil</h1>
                        <p className="__description">Aprenda a como personalizar seu perfil nas aplicações da comunidade</p>
                    </header>
                    <main>
                        <div className="info__row flex">
                            <div className="left__side">
                                <h2 className="__subtitle">Como funciona?</h2>
                                <p className="__description">
                                    Você pode adicionar, remover ou modificar a foto de seu perfil nesta guia de customização. A mudança deve ser feita diretamente no chat da comunidade, digitando um comando 
                                    e passando o token gerado ao finalizar as mudanças por aqui. Infelizmente, para evitar a possibilidade de injeção de arquivos maliciosos dentro do sistema, não há como hospedar
                                    o arquivo de configuração gerado em outros sites, o que restringe sua criação por aqui. Fique à vontade para personalizar o que desejar e modificar o seu perfil. Mais mudanças serão
                                    disponibilizadas em breve. Consulte os outros passos abaixo.
                                </p>
                            </div>
                            <div className="right__side">
                                <div className="__image app__print" style={{backgroundImage: 'url(https://i.imgur.com/RkYxPZT.png)'}}/>
                            </div>
                        </div>
                        <div className="info__row flex">
                            <div className="left__side">
                                <div className="__image select__print" style={{backgroundImage: 'url(https://i.imgur.com/wBOlk44.png)'}}/>
                            </div>
                            <div className="right__side">
                                <h2 className="__subtitle">Alterando a imagem</h2>
                                <p className="__description">
                                    Para alterar o fundo ou a foto do seu perfil você deve passar com ou mouse por cima do elemento até que este mude sua cor. Então, basta clicar nele que irá aparecer uma nova janela
                                    para o envio da foto. Por outro lado, caso queira retornar a página, basta fechar a janela mencionada.
                                </p>
                            </div>
                        </div>
                        <div className="info__row flex">
                            <div className="left__side">
                                <h2 className="__subtitle">Enviando arquivos</h2>
                                <p className="__description">
                                    Você deve enviar o arquivo do seu computador para fazer upload e posteriormente gerar um token que permitirá
                                    que você altere as imagens referentes ao seu perfil. Todo o procedimento após isso é feito diretamente no chat da comunidade
                                    através de um comando do bot.
                                </p>
                            </div>
                            <div className="right__side">
                                <div className="__image upload__print" style={{backgroundImage: 'url(https://i.imgur.com/9pUaeQy.png)'}}/>
                            </div>
                        </div>
                        <div className="info__row flex">
                            <div className="left__side">
                                <div className="__image token__print" style={{backgroundImage: 'url(https://i.imgur.com/LXCeNyL.png)'}}/>
                            </div>
                            <div className="right__side">
                                <h2 className="__subtitle">Uso do token</h2>
                                <p className="__description">
                                    O token gerado após o envio das imagens será exibido em um novo diálogo com as novas informações. O uso dele deve ser feito através do comando 
                                    !img passando o código gerado, que possui validade de 5 minutos após a criação. Após isso o Bot irá interpretar o código e repassar as informações
                                    relativas a ele para o banco de dados da aplicação.
                                </p>
                            </div>
                        </div>
                        <div className="info__row flex">
                            <div className="left__side">
                                <h2 className="__subtitle">Passos finais</h2>
                                <p className="__description">
                                    Por fim, depois de enviar as imagens e obter o token gerado, você deve ir até o chat da sala e utilizar o comando de validação e resgate de código digitando !img e o token gerado,
                                    conforme exposto no print, e suas imagens serão analizadas a e seu perfil atualizado, caso tudo ocorra bem. No mais, você já está pronto para customizar seu perfil,
                                    fique à vontade e uso seu bom senso para modificar o seu perfil na comunidade. Nos vemos novamente em breve!
                                </p>
                            </div>
                            <div className="right__side">
                                <div className="__image chat__print" style={{backgroundImage: 'url(https://i.imgur.com/NAt0gJJ.png)'}}/>
                            </div>
                        </div>
                    </main>
                    <footer>
                        <p>Bem, é o fim. Podemos começar?</p>
                        <button onClick={handleSave}>COMEÇAR <FaArrowRight style={{verticalAlign:'bottom', position: 'relative', top: '-1px', marginLeft: '2px'}}></FaArrowRight></button>
                    </footer>
                </div>
            </div>

        <style jsx>{`
            .ranks__container {
                justiy-content: normal
            }

            .custom__info h1 {
                font-weight: 600;
                margin-bottom: 3px;
            }

            .custom__info p {
                color: rgba(255, 255, 255, .5);
            }

            .custom__info p strong {
                font-weight: 600;
                cursor: pointer;
            }

            .custom__info h1,
            .custom__info p {
                text-align: center;
            }

            .user__header {
                padding: 12px;
                margin-top: 25px;
                width: 50em;
                position: relative;
                background: rgba(255, 255, 255, .05);
                border-radius: 6px;
                background-size: cover !important;
            }

            .select__bg {
                backgroubd: transparent;
                border-radius: 6px;
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                z-index: 1;
                cursor: pointer;
            }

            .select__bg:hover,
            .user__photo:hover,
            .select__bg.active,
            .user__photo.active {
                background: rgba(3, 169, 244, .7) !important;
                box-shadow: inset 0 0 0 4px rgba(0, 0, 0, .2);
            }

            .user__information {
                padding: 10px 30px 20px;
                display: flex;
                align-items: center;
            }

            .user__photo {
                width: 7em;
                height: 7em;
                max-width: 7em;
                min-width: 7em;
                max-height: 7em;
                min-height: 7em;
                border-radius: 100%;
                background: #4b4e51;
                background-size: cover !important;
                margin-right: 25px;
                z-index: 2;
                cursor: pointer;
            }

            .user__name {
                margin-bottom: 3px;
                font-weight: 600;
                line-break: anywhere;
            }

            .user__jointime {
                color: rgba(255, 255, 255, .5);
                margin-bottom: 18px;
            }

            .user__relationship {
                display: flex;
                align-items: center;
            }

            .user__relationship p {
                margin-left: 6px;
                font-size: 16px;
            }

            .user__relationship a {
                text-decoration: none;
                color: white;
                display: flex;
                align-items: center;
            }

            .user__navigator {
                margin-top: 12px;
                list-style: none;
                display: flex;
                padding: 0 10px 5px;                    
            }

            .user__navigator .__item {
                padding: 10px 15px;
                margin-right: 10px;
                background: #4b4e51;
                width: 6em;
                height: 2em;
                border-radius: 4px;
            }

            .loader__bar {
                border-radius: 4px;
                width: 20em;
                height: 2em;
                background: #4b4e51;
            }

            .loader__bar.name {
                width: 25rem;
                margin-bottom: 15px;
            }

            .loader__bar.time {
                height: 1.8em;
                margin-bottom: 20px;
            }

            .loader__bar.love {
                height: 1.5em;
                width: 18em;
            }

            .user__save {
                margin-top: 30px;
                display: none;
                align-items: center;
                justify-content: center;
            }

            .user__save.active {
                display: flex;
            }

            .user__save.active.loading .save__loader {
                display: block;
            }

            .user__save.active.loading .save__button .__content {
                display: none;
            }

            .user__save .save__loader {
                width: 2em;
                height: 19px;
                background-size: cover;
                margin: auto;
                display: none;
            }

            .user__save .save__button {
                background: #4CAF50;
                padding: 11px;
                border-radius: 4px;
                cursor: pointer;
                width: 9.5em;
                text-align: center;
            }

            footer {
                justify-content: normal;
                margin-bottom: 30px;
            }

            .cid__box.active {
                display: flex;
            }

            .cid__box .__content {
                background: #2c2f33;
                width: 33em;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px 25px 18px;
                text-align: center;
            }

            .cid__box .__title {
                font-size: 1.78em;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .cid__box .__description {
                color: rgba(255, 255, 255, .5);
            }

            .cid__box .__description strong {
                font-weight: 600;
            }

            .cid__box .id__display {
                background: rgba(0, 0, 0, .2);
                width: 100%;
                height: 2em;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 22px 0;
                font-size: 1.8em;
                font-weight: bold;
                cursor: text;
            }

            .cid__box .__footer {
                color: rgba(255, 255, 255, .5);
            }

            .cid__box .__footer a,
            .cid__box .__footer strong {
                text-decoration: none;
                font-weight: 600;
                color: white;
                cursor: pointer;
            }

            .upload__box,
            .cid__box {
                position: absolute;
                z-index: 5;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, .5);
                align-items: center;
                justify-content: center;
                display: none;
            }

            .upload__box.active {
                display: flex;
            }

            .upload__box .__content {
                border-radius: 6px;
                width: 31em;
                height: 33em;
                background: #2c2f33;
                position: relative;
            }

            .upload__box .close__button {
                right: 0;
                top: 0;
                margin: 12px;
                position: absolute;
                cursor: pointer;
                opacity: .8;
                transition: all .3s ease;
            }

            .upload__box .close__button:hover {
                opacity: 1;
            }

            .upload__box .drag__area {
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                background: linear-gradient(45deg,#7d188e,#2196F3);
                background-size: 200% 200%;
                width: 100%;
                height: 22em;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
                transition: all .5s ease;
            }

            .upload__box .drag__area.active {
                background-position: 0 100%;
            }

            .upload__box .drag__area.active .__text {
                color: white;
                border-color: white;
            }

            .upload__box .drag__area .__text {
                color: rgba(255,255,255,.7);
                padding: 20px 30px;
                border: 3px dashed rgba(255,255,255,.4);
                border-radius: 6px;
                transition: all .3s ease;
            }

            .upload__box .options__area {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                height: 11em;
            }

            .upload__box .options__area p {
                color: rgba(255, 255, 255, .6);
                margin-bottom: 20px;
            }

            .upload__box .options__area label {
                padding: 10px 14px;
                background: rgba(0, 0, 0, .2);
                border-radius: 4px;
                border: none;
                color: white;
                font-size: 15px;
                position: relative;
                cursor: pointer;
            }

            .upload__box .send__input {
                position: absolute;
                opacity: 0;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                cursor: pointer;
                z-index: -1;
            }

            .init__display {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, .5);
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                top: 0;
                left: 0;
                z-index: 4;
            }

            .init__display.active {
                display: flex;
            }

            .init__display .__content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 48em;
                height: 34em;
                background: #2c2f33;
                border-radius: 4px;
                padding: 20px 35px;
                overflow: auto;
            }

            .init__display .__content header {
                margin-bottom: 10px;
            }

            .init__display .__content header > * {
                text-align: center;
            }

            .init__display .__content header .__title {
                font-weight: 600;
                margin-bottom: 3px;
            }

            .init__display .__content header .__description {
                color: rgba(255, 255, 255, .6);
            }

            .info__row {
                display: flex;
                align-items: center;
                margin-bottom: 30px;
            }

            .info__row .left__side {
                margin-right: 20px;
            }

            .info__row .__image {
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                border-radius: 6px;
            }

            .info__row .__image.app__print {
                width: 20em;
                height: 20em;
            }

            .info__row .__image.select__print {
                width: 20em;
                height: 10em;
            }

            .info__row .__image.upload__print {
                width: 19em;
                height: 19em;
            }

            .info__row .__image.token__print {
                background-size: 101%;
                width: 20em;
                height: 8em;
                background-position: -1px 3%;
            }

            .info__row .__image.chat__print {
                width: 19em;
                height: 7em;
                background-size: contain;
                border-radius: 6px;
            }

            .info__row .__subtitle {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .info__row .__description {
                max-width: 24em;
                color: rgba(255, 255, 255, .6);
            }

            .init__display footer {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
            }

            .init__display footer p {
                color: rgba(255, 255, 255, .6);
                margin-right: 10px;
            }

            .init__display footer button {
                padding: 9px 20px;
                border-radius: 4px;
                font-weight: 600;
                background: #4CAF50;
                color: white;
                font-size: 16px;
                border: none;
                cursor: pointer;
            }
        `}</style>
        </div>
    )
}
