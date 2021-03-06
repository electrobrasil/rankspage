import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import RanksPodium from '../../components/RanksPodium';
import RanksList from '../../components/RanksList';
import { FaLongArrowAltRight, FaLongArrowAltLeft } from 'react-icons/fa';
import ReactGA from 'react-ga';

export default function Tracks(){
    const [topTracks, setTopTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/top/songs').then(response => {
            setTopTracks(response.data);
            setIsLoading(false);
        });

        ReactGA.initialize('UA-0000000-0');
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <div className="ranks__container">
            <Head>
                <title>{(!isLoading && 'Melhores músicas') || 'Carregando'} - Radio Brasil</title>
            </Head>
            <header className="ranks__header">
                <h1 className="ranks__title">Músicas mais votadas da sala</h1>
                {
                    (() => {
                        if(!isLoading){
                            if(topTracks.length >= 3){
                                return (
                                    <div className="ranks__podium">
                                        <RanksPodium 
                                            name={topTracks[1].author+' - '+topTracks[1].name} 
                                            value={topTracks[1].votes}
                                            link={`/redirect/${topTracks[1].format}/[id]`}
                                            as={`/redirect/${topTracks[1].format}/${topTracks[1].mid}`}
                                            height={6}
                                            step={2}
                                        />
                                        <RanksPodium 
                                            name={topTracks[0].author+' - '+topTracks[0].name} 
                                            value={topTracks[0].votes}
                                            link={`/redirect/${topTracks[0].format}/[id]`}
                                            as={`/redirect/${topTracks[0].format}/${topTracks[0].mid}`}
                                            height={8}
                                            step={1}
                                        />
                                        <RanksPodium 
                                            name={topTracks[2].author+' - '+topTracks[2].name} 
                                            value={topTracks[2].votes}
                                            link={`/redirect/${topTracks[2].format}/[id]`}
                                            as={`/redirect/${topTracks[2].format}/${topTracks[2].mid}`}
                                            height={4}
                                            step={3}
                                        />
                                    </div>
                                )
                            }else{
                                return (
                                    <p className="info__center podium">Não há músicas para serem exibidas</p>
                                )
                            }   
                        }else{
                            return (
                                <div className="podium__loaders">
                                    <div className="podium__loader"></div>
                                    <div className="podium__loader"></div>
                                    <div className="podium__loader"></div>
                                </div>
                            )
                        }
                    })()
                }
            </header>
            <main className="ranks__main">
                <h1 className="main_title">Veja a colocação de outras músicas</h1>
                {
                    (isLoading && (
                        <>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                            <div className="row__loader"></div>
                        </>
                    )) || (topTracks.length > 3 ? topTracks.map((media, index) => {
                        if(index > 2)
                            return (
                                <RanksList key={index}
                                    position={index+1} 
                                    name={media.author+' - '+media.name} 
                                    value={media.votes} 
                                    link={`/redirect/${media.format}/`}
                                    data_id={media.mid}
                                    type="VOTOS"
                                />
                            )
                    }) : (
                        <p className="info__center">Não há mais músicas para serem exibidas</p>
                    ))
                }
            </main>
            <footer>
                <div className="footer__buttons">
                    <Link href="/"><a className="to__room back"><FaLongArrowAltLeft/><p>Voltar</p></a></Link>
                    <a href="https://plug.dj/electro-brasil-19" target="_blank" className="to__room"><p>Ir para a sala</p><FaLongArrowAltRight></FaLongArrowAltRight></a>
                </div>
                <p className="creator__credits">Made with <i className="rks__icon rks-love"></i> by <a href="https://github.com/eljonathas" target="_blank">TheMars</a></p>
            </footer>
            <style jsx>{`
                .ranks__container {
                    justify-content: normal;     
                    padding: 40px 0;
                }

                .ranks__header {
                    width: 50em;
                }

                .ranks__title, .main_title {
                    font-size: 1.5em;
                    font-weight: 600;
                    text-align: center;
                }

                .main_title {
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    );
}