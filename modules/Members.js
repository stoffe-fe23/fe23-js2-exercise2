
class Members {
    list = [];
    memberIds = 0;

    constructor(listName) {
        this.name = listName;
    }

    addMember(memberObj) {
        this.memberIds++;
        memberObj.id = this.memberIds;
        this.list.push(memberObj);
    }

    showMembers(container) {
        const outputWrapper = document.createElement("div");
        const outputList = document.createElement("ul");
        const outputHeader = document.createElement("h3");
        outputHeader.innerText = this.name + ': ';

        outputList.id = this.id;
        outputList.className = this.classes;

        for (const item of this.list) {
            const outputItem = document.createElement("li");
            outputItem.innerText = `${item.name} (${item.role})`;
            outputList.appendChild(outputItem);
        }

        outputWrapper.appendChild(outputHeader);
        outputWrapper.appendChild(outputList);
        container.appendChild(outputWrapper);
    }
}

class Member {
    constructor(name, role, id) {
        this.name = name;
        this.role = role;
        this.id = id;
    }
}

export { Members, Member };