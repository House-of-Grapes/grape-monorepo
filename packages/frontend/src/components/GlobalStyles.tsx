import { createGlobalStyle } from 'styled-components'
import { brand } from '../utils/styles'

const GlobalStyles = createGlobalStyle`
 * {
     margin:0;
     padding:0;
 }

 .toaster div {
    word-break: break-word;
 }

    body,html, #__next {


        @media (min-width: 930px) {
            height: 100%;
        }
    }

    * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
    body {
         background-color: ${brand};
        font-family: 'IBM Plex Sans', sans-serif;
        color: white;
        background: rgb(174,38,87);

        background: linear-gradient(180deg, rgba(174,38,87,1) 0%, rgba(147,18,64,1) 100%);
        background-attachment: fixed;

        font-size: 20px; 
        line-height: 1.5;
        @media (min-width: 930px) {
            overflow:hidden;
        }
    }

   

    img {
        max-width: 100%;
    }

    button {
        border: none;
        outline: none;
    }


    h1,h2,h3 {
        /* font-family: 'IBM Plex Mono', monospace; */
    }

    h2 {
        font-size: 3rem;
    }

    div.web3modal-modal-lightbox {
        z-index: 100;
    }
`

export default GlobalStyles
