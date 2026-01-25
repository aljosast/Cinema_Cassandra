 import { DrawUserHeader } from "./Navigation.js";

export class MojProfil {
    constructor(host) {
        this.host = host;
        this.username = localStorage.getItem("username"); 
        this.data = null; 
        this.inputs = {};
        this.errors = {}; 
        this.isEditing = false; 
    }

    async DrawPage() {
        this.host.innerHTML = "";
        DrawUserHeader(this.host, "profil");

        const container = document.createElement("div");
        container.classList.add("Container");
        container.style.marginTop = "50px";
        this.host.appendChild(container);

        const title = document.createElement("h2");
        title.innerText = "MOJ PROFIL";
        title.classList.add("neon-subtitle");
        title.style.textAlign = "center";
        container.appendChild(title);

        // Loading indikator dok ne stignu podaci
        const loading = document.createElement("h3");
        loading.innerText = "Učitavanje podataka...";
        loading.style.color = "#39ff14";
        loading.style.textAlign = "center";
        container.appendChild(loading);

        // Fetch podataka
        try {
            if(!this.username) throw new Error("Niste ulogovani.");

            const resp = await fetch(`https://localhost:7172/api/Korisnik/Podaci/${this.username}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            if (!resp.ok) throw new Error("Greška pri dohvatanju podataka.");
            
            this.data = await resp.json();
            container.removeChild(loading); // Skloni loading
            
            this.DrawForm(container);
            this.DrawPasswordSection(container);

        } catch (err) {
            loading.innerText = "Greška: " + err.message;
            loading.style.color = "red";
        }
    }

    DrawForm(container) {
       
        const profileCard = document.createElement("div");
        profileCard.classList.add("neon-modal");
        profileCard.style.display = "block";
        profileCard.style.margin = "20px auto";
        profileCard.style.maxWidth = "500px";
        container.appendChild(profileCard);

        const header = document.createElement("h2");
        header.innerText = "LIČNI PODACI";
        header.style.color = "#fff";
        header.style.marginBottom = "20px";
        profileCard.appendChild(header);

        const formDiv = document.createElement("div");
        profileCard.appendChild(formDiv);

        const createField = (label, key, type = "text", readonly = false) => {
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "15px";

            const lbl = document.createElement("label");
            lbl.innerText = label;
            lbl.style.color = "#fff";
            lbl.style.display = "block";
            lbl.style.marginBottom = "5px";
            lbl.style.fontSize = "0.8rem";
            wrapper.appendChild(lbl);

            const input = document.createElement("input");
            input.className = "neon-input";
            input.type = type;
            input.value = this.data[key];
            input.disabled = true; 
            
            if (readonly) {
                input.style.opacity = "0.5";
                input.style.cursor = "not-allowed";
            }

            wrapper.appendChild(input);

            const err = document.createElement("div");
            err.style.color = "#39ff14";
            err.style.fontSize = "0.7rem";
            err.style.marginTop = "3px";
            err.style.display = "none"; 
            wrapper.appendChild(err);

            this.inputs[key] = input;
            this.errors[key] = err;
            formDiv.appendChild(wrapper);
        };

        // Kreiranje polja
        createField("KORISNIČKO IME:", "username", "text", true);
        createField("IME:", "ime");
        createField("PREZIME:", "prezime");
        createField("GODINE:", "godine", "number");

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "20px";
        formDiv.appendChild(btnContainer);
        this.btnContainer = btnContainer; 
        
        this.RenderButtons();
    }
    DrawPasswordSection(container) {
        const passCard = document.createElement("div");
        passCard.classList.add("neon-modal");
        passCard.style.display = "block";
        passCard.style.margin = "40px auto";
        passCard.style.maxWidth = "500px";
        container.appendChild(passCard);

        const header = document.createElement("h2");
        header.innerText = "PROMENA LOZINKE";
        header.style.color = "#fff";
        header.style.marginBottom = "20px";
        passCard.appendChild(header);

        const createPassInput = (placeholder) => {
            const inp = document.createElement("input");
            inp.type = "password";
            inp.placeholder = placeholder;
            inp.className = "neon-input";
            inp.style.marginBottom = "15px";
            passCard.appendChild(inp);
            return inp;
        };

        const oldPass = createPassInput("STARA LOZINKA");
        const newPass = createPassInput("NOVA LOZINKA");

        const btnChangePass = document.createElement("button");
        btnChangePass.innerText = "POTVRDI PROMENU";
        btnChangePass.classList.add("modal-text-btn"); 
        btnChangePass.style.width = "100%";
        
        btnChangePass.onclick = async () => {
            if (!oldPass.value || !newPass.value) {
                alert("Popunite oba polja!");
                return;
            }

            const url = `https://localhost:7172/api/Korisnik/EditPassword?oldPassword=${encodeURIComponent(oldPass.value)}&newPassword=${encodeURIComponent(newPass.value)}`;

            try {
                const resp = await fetch(url, {
                    method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify(this.username) 
                });

                if (resp.ok) {
                    alert("Lozinka uspešno promenjena!");
                    oldPass.value = ""; 
                    newPass.value = "";
                } else {
                    alert("Greška: " + await resp.text());
                }
            } catch (e) {
                alert("Greška na serveru.");
            }
        };

        passCard.appendChild(btnChangePass);
    }
    RenderButtons() {
        this.btnContainer.innerHTML = ""; 

        if (!this.isEditing) {
            const btnEdit = document.createElement("button");
            btnEdit.innerText = "IZMENI PODATKE";
            btnEdit.classList.add("modal-text-btn");
            btnEdit.style.width = "100%";
            btnEdit.onclick = () => this.ToggleEditMode(true);
            this.btnContainer.appendChild(btnEdit);
        } else {
            const wrap = document.createElement("div");
            wrap.style.display = "flex";
            wrap.style.gap = "10px";

            const btnCancel = document.createElement("button");
            btnCancel.innerText = "ODUSTANI";
            btnCancel.classList.add("button");
            btnCancel.style.flex = "1";
            btnCancel.style.borderColor = "#555";
            btnCancel.style.color = "#aaa";
            btnCancel.onclick = () => this.ToggleEditMode(false);

            const btnSave = document.createElement("button");
            btnSave.innerText = "SAČUVAJ";
            btnSave.classList.add("modal-text-btn");
            btnSave.style.flex = "1";
            btnSave.onclick = () => this.SaveChanges();

            wrap.appendChild(btnCancel);
            wrap.appendChild(btnSave);
            this.btnContainer.appendChild(wrap);
        }
    }


    ToggleEditMode(enable) {
        this.isEditing = enable;
        for (const key in this.inputs) {
            if (key !== "username") {
                this.inputs[key].disabled = !enable;
                this.inputs[key].style.border = enable ? "1px solid #39ff14" : "1px solid #333";
            }
        }
        if (!enable) {
            this.inputs["ime"].value = this.data.ime;
            this.inputs["prezime"].value = this.data.prezime;
            this.inputs["godine"].value = this.data.godine;
            for(const k in this.errors) this.errors[k].style.display = "none";
        }

        this.RenderButtons();
    }

     async SaveChanges() {
        const novoIme = this.inputs["ime"].value.trim();
        const novoPrezime = this.inputs["prezime"].value.trim();
        const noveGodine = parseInt(this.inputs["godine"].value);

        if (!novoIme || !novoPrezime || isNaN(noveGodine)) {
            alert("Sva polja moraju biti ispravno popunjena!");
            return;
        }

        const objZaSlanje = {
            username: this.data.username,
            ime: novoIme,
            prezime: novoPrezime,
            godine: noveGodine,
            password: "", 
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
                this.data.ime = novoIme;
                this.data.prezime = novoPrezime;
                this.data.godine = noveGodine;
                this.ToggleEditMode(false);
            } else {
                alert("Greška pri čuvanju.");
            }
        } catch (e) { console.error(e); }
    }
}