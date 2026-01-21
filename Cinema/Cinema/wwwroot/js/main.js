import {Film, layout} from "./Film.js"

const host = document.body;
let page = 0;
let max_page;

Drawpage()

function Drawpage(){
    host.innerHTML = "";
    layout(host,3)
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
                button.onclick = () => { DrawInsertPage() }
                host.appendChild(button);

                for (let d of data){
                    let film = new Film(host,d.id,d.naziv,d.zanr,d.reziser,d.dugiOpis,d.opis,d.slika,d.glumci);
                    film.Kartica(host);
                }
                
                const r = document.createElement("div");
                r.classList.add("r");
                host.appendChild(r);

                const prev_btn = document.createElement("button");
                if (page == 0)  {prev_btn.disabled = true; prev_btn.style.borderColor = "grey"; prev_btn.style.color = "grey";}
                prev_btn.innerText = "Prethodna strana";
                prev_btn.classList.add("button");
                prev_btn.onclick = () => {
                    page = page - 1
                    Drawpage();
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
                    Drawpage();
                };
                r.appendChild(next_btn);
            }
        )
    )

}

function DrawInsertPage(fid = "",naziv = "", zanr = "", opis = "", dugiOpis = "", reziser = "", slika = "", glumci = [], edit = false){
    host.innerHTML = "";
    layout(host,3)
    const button = document.createElement("button");
                button.innerText = "Lista filmova";
                button.classList.add("button");
                button.onclick = () => { Drawpage() };
                host.appendChild(button);


    
    const buttonplus = document.createElement("button");
                buttonplus.innerText = "Dodaj glumca";
                buttonplus.classList.add("button");
                buttonplus.onclick = () => { 
                    imena = [...imena, document.createElement("input")];
                    uloge = [...uloge, document.createElement("input")];
                    tipUloge = [...tipUloge, document.createElement("input")];
                    DrawGlumci(container,imena,uloge,tipUloge);
                };
                host.appendChild(buttonplus);

    const form = document.createElement("form");
    host.appendChild(form);
    form.onsubmit = (event) => {
        event.preventDefault();

        let g = [];
        for (let i in imena){
            const obj = {
                Id : "1",
                Ime : imena[i].value,
                Uloga : uloge[i].value,
                TipUloge : tipUloge[i].value
            }

            g = [...g,obj];
        }
        if (!edit){
            postaviFilm(
                naziv_box.value,
                zanr_box.value,
                opis_box.value,
                dugiOpis_box.value,
                reziser_box.value,
                g,
                slika_box
            )
        }
        else{
            izmeniFilm(
                fid,
                naziv_box.value,
                zanr_box.value,
                opis_box.value,
                dugiOpis_box.value,
                reziser_box.value,
                g,
                slika_box
            )
        }
    }

    const img = document.createElement("img");
    img.src = "images/" + slika;
    img.classList.add("img_box");
    form.appendChild(img);

    //Naziv

    const naziv_row = document.createElement("div");
                naziv_row.classList.add("row");
                form.appendChild(naziv_row);

    const naziv_label = document.createElement("div");
                naziv_label.innerText = "Naziv : ";
                naziv_label.classList.add("label");
                naziv_row.appendChild(naziv_label);        

    const naziv_box = document.createElement("input");
                naziv_box.classList.add("input");
                naziv_box.value = naziv;
                naziv_row.appendChild(naziv_box);

    //Zanr

    const zanr_row = document.createElement("div");
                zanr_row.classList.add("row");
                form.appendChild(zanr_row);

    const zanr_label = document.createElement("div");
                zanr_label.innerText = "Zanr : ";
                zanr_label.classList.add("label");
                zanr_row.appendChild(zanr_label);  

    const zanr_box = document.createElement("input");
                zanr_box.classList.add("input");
                zanr_box.value = zanr;
                zanr_row.appendChild(zanr_box);

    //Opis

    const opis_row = document.createElement("div");
                opis_row.classList.add("row");
                form.appendChild(opis_row);

    const opis_label = document.createElement("div");
                opis_label.innerText = "Opis : ";
                opis_label.classList.add("label");
                opis_row.appendChild(opis_label);  

    const opis_box = document.createElement("input");
                opis_box.classList.add("input");
                opis_box.value = opis;
                opis_row.appendChild(opis_box);

    //Dugi opis

    const dugiOpis_row = document.createElement("div");
                dugiOpis_row.classList.add("row");
                form.appendChild(dugiOpis_row);

    const dugiOpis_label = document.createElement("div");
                dugiOpis_label.innerText = "Dugi opis : ";
                dugiOpis_label.classList.add("label");
                dugiOpis_row.appendChild(dugiOpis_label);  

    const dugiOpis_box = document.createElement("input");
                dugiOpis_box.classList.add("input");
                dugiOpis_box.type = "textarea";
                dugiOpis_box.rows = "10";
                dugiOpis_box.value = dugiOpis;
                dugiOpis_row.appendChild(dugiOpis_box);

    //Reziser

    const reziser_row = document.createElement("div");
                reziser_row.classList.add("row");
                form.appendChild(reziser_row);

    const reziser_label = document.createElement("div");
                reziser_label.innerText = "Reziser : ";
                reziser_label.classList.add("label");
                reziser_row.appendChild(reziser_label);  

    const reziser_box = document.createElement("input");
                reziser_box.classList.add("input");
                reziser_box.value = reziser;
                reziser_row.appendChild(reziser_box);

    //Slika

    const slika_row = document.createElement("div");
                slika_row.classList.add("row");
                form.appendChild(slika_row);

    const slika_label = document.createElement("div");
                slika_label.innerText = "Slika : ";
                slika_label.classList.add("label");
                slika_row.appendChild(slika_label);  

    const slika_box = document.createElement("input");
                slika_box.classList.add("input");
                slika_box.type = "file";
                slika_box.accept = "image/*";
                slika_row.appendChild(slika_box);
                slika_box.onchange = () =>{
                    const file = slika_box.files[0]; 
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            img.src = e.target.result; 
                        };
                        reader.readAsDataURL(file); 
                    }
                }
    //Glumci

    

    let imena = []
    let uloge = []
    let tipUloge = []

    const glumci_row = document.createElement("div");
    glumci_row.classList.add("row");
                form.appendChild(glumci_row);

    const glumci_label = document.createElement("div");
                glumci_label.innerText = "Glumci : ";
                glumci_label.classList.add("label");
                glumci_row.appendChild(glumci_label); 
    const container = document.createElement("div");

    form.appendChild(container);

    if (edit){
        for (let glumac of glumci){
            imena = [...imena, document.createElement("input")];
            imena[glumci.indexOf(glumac)].value = glumac.ime;
            uloge = [...uloge,document.createElement("input")];
            uloge[glumci.indexOf(glumac)].value = glumac.uloga;
            tipUloge = [...tipUloge,document.createElement("input")];
            tipUloge[glumci.indexOf(glumac)].value = glumac.tipUloge;
        }
        DrawGlumci(container,imena,uloge,tipUloge);
    }

    //Submit

    const sub = document.createElement("input");
    sub.type = "submit";
    sub.value = "Postavi film";
    form.appendChild(sub);
    
}

function DrawGlumci(container,imena,uloge,tipUloge){
    if (container.innerHTML)
        container.innerHTML = "";
    for (let i in imena){

        // Divider

        const row = document.createElement("div");
                row.classList.add("line");
                container.appendChild(row);

        // Imena
        
        const ime_row = document.createElement("div");
                ime_row.classList.add("row");
                container.appendChild(ime_row);

        const ime_label = document.createElement("div");
                ime_label.innerText = "Ime i prezime : ";
                ime_label.classList.add("label");
                ime_row.appendChild(ime_label);  

        ime_row.appendChild(imena[i]);

        // Uloge

        const uloga_row = document.createElement("div");
                uloga_row.classList.add("row");
                container.appendChild(uloga_row);

        const uloga_label = document.createElement("div");
                uloga_label.innerText = "Uloga : ";
                uloga_label.classList.add("label");
                uloga_row.appendChild(uloga_label);  

        uloga_row.appendChild(uloge[i]);

        // TipIloge

        const tipuloga_row = document.createElement("div");
                tipuloga_row.classList.add("row");
                container.appendChild(tipuloga_row);

        const tipuloga_label = document.createElement("div");
                tipuloga_label.innerText = "Tip uloge : ";
                tipuloga_label.classList.add("label");
                tipuloga_row.appendChild(tipuloga_label);  

        tipuloga_row.appendChild(tipUloge[i]);

        // Controlles

        const button_row = document.createElement("div");
                button_row.style.paddingLeft = "10%";
                container.appendChild(button_row);

        const button = document.createElement("button");
                button.innerText = "Obrisi glumca";
                button.classList.add("button");
                button.style.width = "55%";
                button.onclick = (event) => { 
                    event.preventDefault();
                    imena.splice(i, 1);
                    uloge.splice(i, 1);
                    tipUloge.splice(i, 1);
                    DrawGlumci(container,imena,uloge,tipUloge);
                 };
                button_row.appendChild(button);
    };
}



const postaviFilm = async (naziv,zanr,opis,dugiOpis,reziser,glumci,fileInput) => {

    const file = fileInput.files[0];
    
    const formData = new FormData();
    formData.append("Naziv", naziv);
    formData.append("Id", "a");
    formData.append("Opis", opis);
    formData.append("DugiOpis", dugiOpis);
    formData.append("Reziser", reziser);
    formData.append("Zanr", zanr);
    formData.append("JsonGlumci", JSON.stringify(glumci))
    formData.append("Slika", file);
   
        try {
            const response = await fetch("https://localhost:7172/api/Film/PostaviFilm", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                console.log("Uspeh:", result);

                Drawpage();
            } else {
                console.error("Greška:", response.statusText);
            }
        } catch (error) {
            console.error("Došlo je do greške:", error);
        }
};

const izmeniFilm = async (id,naziv,zanr,opis,dugiOpis,reziser,glumci,fileInput) => {

    const file = fileInput.files[0];
    
    const formData = new FormData();
    formData.append("Naziv", naziv);
    formData.append("Id", id);
    formData.append("Opis", opis);
    formData.append("DugiOpis", dugiOpis);
    formData.append("Reziser", reziser);
    formData.append("Zanr", zanr);
    formData.append("JsonGlumci", JSON.stringify(glumci))
    formData.append("Slika", file);
    
        try {
            const response = await fetch("https://localhost:7172/api/Film/IzmeniFilm", {
                method: "PUT",
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                console.log("Uspeh:", result);

                Drawpage();

            } else {
                console.error("Greška:", response.statusText);
            }
        } catch (error) {
            console.error("Došlo je do greške:", error);
        }
};

export {
    DrawInsertPage,
    Drawpage
}