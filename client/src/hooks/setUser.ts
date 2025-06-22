async function setUser(id: number) {
    try {
        const res = await fetch("http://localhost:3001/api/getToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const text = res.text();
        if (res.ok) {
            try {
                const res2 = await fetch("http://localhost:3001/api/getToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, text }),
                });

                const text2 = await res2.text();
                if (res2.ok) {
                    localStorage.setItem("authToken", text2);
                } else console.error("Error setting user token:", text2);
            } catch (err) {
                console.error("Error parsing response:", err);
            }
        } else console.error(text);
    } catch (err) {
        console.error(err);
    }
}

export default setUser;