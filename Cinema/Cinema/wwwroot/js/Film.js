import { DrawInsertPage,Drawpage } from "./main.js";

class Film{
    constructor(host,id,naziv,zanr,reziser,dugiOpis,opis,slika,glumci){
        this.host = host;
        this.id = id;
        this.naziv = naziv;
        this.zanr = zanr;
        this.reziser = reziser;
        this.opis = opis;
        this.dugiOpis = dugiOpis;
        this.slika = slika;
        this.glumci = glumci;
        this.modal = document.createElement("div");
        this.modal.classList.add("modal");
        this.host.appendChild(this.modal);
    }

    Kartica(){

        const card = document.createElement("div");
        card.classList.add("CardRow");
        this.host.appendChild(card);

        card.onclick = () =>{
            this.Modal();
        }

        const img = document.createElement("img");
        img.src = "images/" + this.slika;
        card.appendChild(img);

        const container = document.createElement("div");
        container.classList.add("Container");
        card.appendChild(container);

        const row1 = document.createElement("div");
        row1.classList.add("Row");
        container.appendChild(row1);
        const label1 = document.createElement("div");
        label1.innerHTML = "Naziv:";
        row1.appendChild(label1);
        const val1 = document.createElement("div");
        val1.innerHTML = this.naziv;
        row1.appendChild(val1);

        const row2 = document.createElement("div");
        row2.classList.add("Row");
        container.appendChild(row2);
        const label2 = document.createElement("div");
        label2.innerHTML = "Zanr:";
        row2.appendChild(label2);
        const val2 = document.createElement("div");
        val2.innerHTML = this.zanr;
        row2.appendChild(val2);

        const row3 = document.createElement("div");
        row3.classList.add("Row");
        container.appendChild(row3);
        const label3 = document.createElement("div");
        label3.innerHTML = "Reziser:";
        row3.appendChild(label3);
        const val3 = document.createElement("div");
        val3.innerHTML = this.reziser;
        row3.appendChild(val3);

        const row4 = document.createElement("div");
        row4.classList.add("Row");
        container.appendChild(row4);
        const label4 = document.createElement("div");
        label4.innerHTML = "Opis:";
        row4.appendChild(label4);
        const val4 = document.createElement("div");
        val4.innerHTML = this.opis;
        row4.appendChild(val4);

    }

    Modal(){
        this.modal.innerHTML = "";
        this.modal.style.display = "block";
        const modal_content = document.createElement("div");
        modal_content.classList.add("modal-content");
        this.modal.appendChild(modal_content);

        const card = document.createElement("div");
        card.style.display = "flex";
        modal_content.appendChild(card);

        const img_box = document.createElement("div");
        img_box.style.width = "fit-content";
        img_box.style.height = "fit-content";
        card.appendChild(img_box);

        const img = document.createElement("img");
        img.classList.add("image");
        img.src = "images/" + this.slika;
        img_box.appendChild(img);

        const row = document.createElement("div");
        row.classList.add("Row");
        img_box.appendChild(row);

        const edit_btn = document.createElement("button");
        edit_btn.innerText = "Izmeni";
        edit_btn.classList.add("close-button");
        edit_btn.onclick = () => {
            DrawInsertPage(this.id,this.naziv, this.zanr, this.opis, this.dugiOpis, this.reziser, this.slika, this.glumci, true);
        }
        row.appendChild(edit_btn);

        const del_btn = document.createElement("button");
        del_btn.innerText = "Izbrisi";
        del_btn.classList.add("close-button");
        del_btn.onclick = () => {
            console.log("del_btn");
            obrisifilm(this.id)
        }
        row.appendChild(del_btn);

        const container = document.createElement("div");
        container.classList.add("Container");
        container.style.padding = "5%";
        card.appendChild(container);

        const row1 = document.createElement("div");
        row1.classList.add("Row");
        container.appendChild(row1);
        const label1 = document.createElement("div");
        label1.innerHTML = "Naziv:";
        row1.appendChild(label1);
        const val1 = document.createElement("div");
        val1.innerHTML = this.naziv;
        row1.appendChild(val1);

        const row2 = document.createElement("div");
        row2.classList.add("Row");
        container.appendChild(row2);
        const label2 = document.createElement("div");
        label2.innerHTML = "Zanr:";
        row2.appendChild(label2);
        const val2 = document.createElement("div");
        val2.innerHTML = this.zanr;
        row2.appendChild(val2);

        const row3 = document.createElement("div");
        row3.classList.add("Row");
        container.appendChild(row3);
        const label3 = document.createElement("div");
        label3.innerHTML = "Reziser:";
        row3.appendChild(label3);
        const val3 = document.createElement("div");
        val3.innerHTML = this.reziser;
        row3.appendChild(val3);

        const val4 = document.createElement("div");
        val4.innerHTML = this.dugiOpis;
        val4.style.padding = "5%";
        val4.style.fontSize = "xx-large";
        container.appendChild(val4);

        for (let glumac of this.glumci){
            const row = document.createElement("div");
            row.classList.add("r");
            modal_content.appendChild(row);

            const val1 = document.createElement("div");
            val1.innerHTML = glumac.tipUloge + " uloga:";
            row.appendChild(val1);

            const val2 = document.createElement("div");
            val2.innerHTML = glumac.ime;
            row.appendChild(val2);

            const val3 = document.createElement("div");
            val3.innerHTML = glumac.uloga;
            row.appendChild(val3);
        }

        const r = document.createElement("div");
        r.classList.add("r");
        modal_content.appendChild(r);

        const button = document.createElement("button");
        button.classList.add("close-button");
        button.innerText = "Zatvori";
        button.onclick = () => {this.modal.style.display = "none";};
        r.appendChild(button);
    }
}

function layout(host,page){
    const header = document.createElement("div");
    header.classList.add("header");
    host.appendChild(header)

    const title = document.createElement("div");
    title.innerText = "Cinema";
    title.classList.add("title");
    header.appendChild(title);

    const opt = document.createElement("div");
    opt.classList.add("option-bar");
    header.appendChild(opt);

    const box1 = document.createElement("div");
    box1.classList.add("box");
    box1.innerText = "Pocetna strana";
    if (page === 1) box1.classList.add("inverse");
    opt.appendChild(box1);

    const box2 = document.createElement("div");
    box2.classList.add("box");
    box2.innerText = "Bioskopi";
    if (page === 2) box2.classList.add("inverse");
    opt.appendChild(box2);

    const box3 = document.createElement("div");
    box3.classList.add("box");
    box3.innerText = "Filmovi";
    if (page === 3) box3.classList.add("inverse");
    opt.appendChild(box3);
}

async function obrisifilm(id) {
    try {
        const response = await fetch(`https://localhost:7172/api/Film/ObrisiFilm/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json", 
            }
        });

        if (response.ok) {
            const result = await response.text();
            console.log("Uspeh:", result);
            alert(response);

            Drawpage();
        } else {
            console.error("Greška:", response.statusText);
        }
    } catch (error) {
        console.error("Došlo je do greške:", error);
    }
}

export {Film,layout}