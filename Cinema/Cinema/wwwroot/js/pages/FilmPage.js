import { Film } from "../entities/Film.js"
import { DrawInsertPage } from "./InsertPage.js"

export function DrawFilmPage(host, page, max_page){

    let container = document.createElement("div")
    container.classList.add("filmPage")
    host.appendChild(container)

    fetch(`https://localhost:7172/api/Film/Brojfilmova`).then(
        response => response.json()
        .then(
            data => {
                max_page = Math.ceil(data / 10);
            }
            
        )
    )
    fetch(`https://localhost:7172/api/Film/ListaFilmova/${page}`).then(
        response => response.json()
        .then(
            data => {
                console.log(data)

                const button = document.createElement("button");
                button.innerText = "Novi film"
                button.classList.add("button");
                button.onclick = () => { 
                    //container.remove();
                    DrawInsertPage(host, page, max_page, container) }
                container.appendChild(button);

                for (let d of data){
                    let film = new Film(host,page,max_page,container,d.id,d.naziv,d.zanr,d.reziser,d.dugiOpis,d.opis,d.slika,d.glumci);
                    film.Kartica(container);
                }
                
                const r = document.createElement("div");
                r.classList.add("r");
                container.appendChild(r);

                const prev_btn = document.createElement("button");
                if (page == 0)  {prev_btn.disabled = true; prev_btn.style.borderColor = "grey"; prev_btn.style.color = "grey";}
                prev_btn.innerText = "Prethodna strana";
                prev_btn.classList.add("button");
                prev_btn.onclick = () => {
                    page = page - 1
                    container.remove();
                    DrawFilmPage(host, page, max_page);
                };
                r.appendChild(prev_btn);

                const box = document.createElement("div");
                box.innerText = `${page + 1}/${max_page}`;
                r.appendChild(box);

                const next_btn = document.createElement("button");
                if (page == max_page - 1) {next_btn.disabled = true; next_btn.style.borderColor = "grey"; next_btn.style.color = "grey";}
                next_btn.innerText = "Sledeca strana";
                next_btn.classList.add("button");
                next_btn.onclick = () => {
                    page = page + 1
                    container.remove();
                    DrawFilmPage(host, page, max_page);
                };
                r.appendChild(next_btn);
            }
        )
    )

}