 import { DrawUserHeader } from "./Navigation.js";

export class MojProfil {
    constructor(host) {
        this.host = host;
        this.username = localStorage.getItem("username"); // Čitamo koga gledamo
        this.data = null; // Ovde ćemo čuvati podatke sa servera
        this.inputs = {}; // Reference na input polja
        this.errors = {}; // Reference na error poruke
        this.isEditing = false; // Pratimo da li menjamo podatke
    }

    async DrawPage() {
        this.host.innerHTML = "";
        
        // 1. Header
        DrawUserHeader(this.host, "profil");

        const container = document.createElement("div");
        container.classList.add("Container");
        container.style.maxWidth = "500px"; // Malo uže za profil
        container.style.marginTop = "50px";
        this.host.appendChild(container);

        const title = document.createElement("h2");
        title.innerText = "MOJ PROFIL";
        title.style.borderBottom = "1px solid #333";
        title.style.paddingBottom = "15px";
        container.appendChild(title);

        // Loading indikator dok ne stignu podaci
        const loading = document.createElement("h3");
        loading.innerText = "Učitavanje podataka...";
        loading.style.color = "#39ff14";
        container.appendChild(loading);

        // 2. Fetch podataka
        try {
            if(!this.username) throw new Error("Niste ulogovani.");

            const resp = await fetch(`https://localhost:7172/api/Korisnik/Podaci/${this.username}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } // Ako ti treba token
            });

            if (!resp.ok) throw new Error("Greška pri dohvatanju podataka.");
            
            this.data = await resp.json();
            container.removeChild(loading); // Skloni loading
            
            this.DrawForm(container);

        } catch (err) {
            loading.innerText = "Greška: " + err.message;
            loading.style.color = "red";
        }
    }

    DrawForm(container) {
        const formDiv = document.createElement("div");
        formDiv.style.marginTop = "20px";
        container.appendChild(formDiv);

        // Helper za kreiranje polja sa validacijom
        const createField = (label, key, type = "text", readonly = false) => {
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "20px";

            const lbl = document.createElement("div");
            lbl.innerText = label;
            lbl.style.color = "#39ff14";
            lbl.style.fontWeight = "bold";
            lbl.style.marginBottom = "5px";
            lbl.style.fontSize = "0.9rem";
            wrapper.appendChild(lbl);

            const input = document.createElement("input");
            input.classList.add("input");
            input.type = type;
            input.value = this.data[key];
            input.disabled = true; // Po defaultu zaključano
            
            // Username ne sme nikad da se menja jer je ID
            if (readonly) {
                input.style.opacity = "0.5";
                input.title = "Ovo polje se ne može menjati.";
            }

            wrapper.appendChild(input);

            // Error poruka (sakrivena)
            const err = document.createElement("div");
            err.innerText = "Ovo polje je obavezno!";
            err.style.color = "#ff5555";
            err.style.fontSize = "0.8rem";
            err.style.marginTop = "5px";
            err.style.display = "none"; // Sakriveno
            wrapper.appendChild(err);

            // Čuvamo reference
            this.inputs[key] = input;
            this.errors[key] = err;

            formDiv.appendChild(wrapper);
        };

        // Kreiranje polja
        createField("KORISNIČKO IME:", "username", "text", true); // Readonly
        createField("IME:", "ime");
        createField("PREZIME:", "prezime");
        createField("GODINE:", "godine", "number");

        // Kontejner za dugmiće
        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.gap = "10px";
        btnContainer.style.marginTop = "30px";
        formDiv.appendChild(btnContainer);
        
        this.btnContainer = btnContainer; // Čuvamo ref da menjamo sadržaj

        // Prvo iscrtavanje dugmića (Samo "IZMENI")
        this.RenderButtons();
    }

    RenderButtons() {
        this.btnContainer.innerHTML = ""; // Očisti stare dugmiće

        if (!this.isEditing) {
            // --- STANJE 1: SAMO GLEDANJE ---
            const btnEdit = document.createElement("button");
            btnEdit.innerText = "IZMENI PODATKE";
            btnEdit.classList.add("button"); // Tvoja zelena klasa
            btnEdit.style.width = "100%";
            
            btnEdit.onclick = () => {
                this.ToggleEditMode(true);
            };
            this.btnContainer.appendChild(btnEdit);

        } else {
            // --- STANJE 2: IZMENA ---
            
            // Dugme ODUSTANI
            const btnCancel = document.createElement("button");
            btnCancel.innerText = "ODUSTANI";
            btnCancel.classList.add("button");
            btnCancel.style.borderColor = "#555";
            btnCancel.style.color = "#aaa";
            btnCancel.style.flex = "1";
            
            btnCancel.onclick = () => {
                this.ToggleEditMode(false); // Vrati na staro
            };
            this.btnContainer.appendChild(btnCancel);

            // Dugme SAČUVAJ
            const btnSave = document.createElement("button");
            btnSave.innerText = "SAČUVAJ";
            btnSave.classList.add("button");
            btnSave.style.backgroundColor = "#39ff14";
            btnSave.style.color = "black";
            btnSave.style.flex = "1";

            btnSave.onclick = () => {
                this.SaveChanges();
            };
            this.btnContainer.appendChild(btnSave);
        }
    }

    ToggleEditMode(enable) {
        this.isEditing = enable;

        // Prolazimo kroz sve inpute i otključavamo/zaključavamo
        // OSIM 'username' (njega smo označili kao readonly u logici iznad, ali ovde ga eksplicitno preskačemo)
        for (const key in this.inputs) {
            if (key !== "username") {
                this.inputs[key].disabled = !enable;
                // Vizuelni efekat fokusiranja
                this.inputs[key].style.borderColor = enable ? "#39ff14" : "#444";
            }
        }
        
        // Ako odustanemo, vratimo stare vrednosti
        if (!enable) {
            this.inputs["ime"].value = this.data.ime;
            this.inputs["prezime"].value = this.data.prezime;
            this.inputs["godine"].value = this.data.godine;
            // Sakrij greške
            for(const k in this.errors) this.errors[k].style.display = "none";
        }

        this.RenderButtons();
    }

    async SaveChanges() {
        // 1. Validacija
        let isValid = true;
        
        // Helper za prikaz greške
        const showError = (key, msg) => {
            this.errors[key].innerText = msg;
            this.errors[key].style.display = "block";
            isValid = false;
        };
        const hideError = (key) => { this.errors[key].style.display = "none"; };

        // Provera polja
        const novoIme = this.inputs["ime"].value.trim();
        const novoPrezime = this.inputs["prezime"].value.trim();
        const noveGodine = parseInt(this.inputs["godine"].value);

        if (!novoIme) showError("ime", "Ime ne sme biti prazno."); else hideError("ime");
        if (!novoPrezime) showError("prezime", "Prezime ne sme biti prazno."); else hideError("prezime");
        
        if (isNaN(noveGodine) || noveGodine < 10 || noveGodine > 100) {
            showError("godine", "Godine moraju biti između 10 i 100.");
        } else hideError("godine");

        if (!isValid) return; // Prekini ako ima grešaka

        // 2. Slanje na server
        // Tvoj kontroler EditAccount traži KorisnikDTO objekat
        const objZaSlanje = {
            username: this.data.username, // Username šaljemo da zna koga menja
            ime: novoIme,
            prezime: novoPrezime,
            godine: noveGodine,
            password: this.data.password, // Moramo poslati i stari pass jer ga DTO traži, ili prazan string ako ga backend ignoriše
            role: this.data.role
        };

        try {
            const resp = await fetch("https://localhost:7172/api/Korisnik/EditAccount", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify(objZaSlanje)
            });

            if (resp.ok) {
                alert("Podaci uspešno izmenjeni!");
                // Ažuriramo lokalne podatke
                this.data.ime = novoIme;
                this.data.prezime = novoPrezime;
                this.data.godine = noveGodine;
                
                this.ToggleEditMode(false); // Zatvori edit mod
            } else {
                const txt = await resp.text();
                alert("Greška servera: " + txt);
            }
        } catch (e) {
            console.error(e);
            alert("Došlo je do greške pri komunikaciji sa serverom.");
        }
    }
}