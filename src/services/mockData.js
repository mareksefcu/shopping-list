// services/mockData.js
// Mock data for development and testing

let mockLists = [
    {
        _id: 'list-1',
        name: 'Týdenní nákup',
        description: 'Nákup na celý týden',
        ownerId: 'user-1',
        memberIds: ['user-2'],
        items: [
            {
                itemId: 'item-1',
                name: 'Mléko',
                quantity: 2,
                unit: 'l',
                done: false
            },
            {
                itemId: 'item-2',
                name: 'Chléb',
                quantity: 1,
                unit: 'ks',
                done: true
            },
            {
                itemId: 'item-3',
                name: 'Jablka',
                quantity: 1,
                unit: 'kg',
                done: false
            }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isArchived: false
    },
    {
        _id: 'list-2',
        name: 'Potřeby pro psa',
        description: 'Krmivo a hračky',
        ownerId: 'user-2',
        memberIds: [],
        items: [
            {
                itemId: 'item-4',
                name: 'Granule',
                quantity: 5,
                unit: 'kg',
                done: false
            },
            {
                itemId: 'item-5',
                name: 'Hračka',
                quantity: 1,
                unit: 'ks',
                done: true
            }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isArchived: true
    }
];

let mockUsers = [
    {
        _id: 'user-1',
        email: 'jan@example.com',
        name: 'Jan Novák',
        password: 'password123' // In real app, this would be hashed
    },
    {
        _id: 'user-2',
        email: 'petra@example.com',
        name: 'Petra Svobodová',
        password: 'password123'
    }
];

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
    async register(email, password, name) {
        await delay();
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }
        const newUser = {
            _id: `user-${Date.now()}`,
            email,
            name,
            password
        };
        mockUsers.push(newUser);
        return {
            success: true,
            userId: newUser._id
        };
    },

    async login(email, password) {
        await delay();
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        // Generate mock token
        const token = `mock-token-${user._id}-${Date.now()}`;
        return {
            success: true,
            userId: user._id,
            token
        };
    }
};

export const mockListService = {
    async getLists(userId) {
        await delay();
        return mockLists.filter(list => 
            list.ownerId === userId || list.memberIds.includes(userId)
        );
    },

    async getList(listId) {
        await delay();
        const list = mockLists.find(l => l._id === listId);
        if (!list) {
            throw new Error('List not found');
        }
        return list;
    },

    async createList(listData) {
        await delay();
        const newList = {
            _id: `list-${Date.now()}`,
            name: listData.name,
            description: listData.description || null,
            ownerId: listData.ownerId,
            memberIds: [],
            items: (listData.items || []).map(item => ({
                itemId: `item-${Date.now()}-${Math.random()}`,
                ...item,
                done: false
            })),
            createdAt: new Date().toISOString(),
            isArchived: false
        };
        mockLists.push(newList);
        return {
            listId: newList._id,
            name: newList.name,
            ownerId: newList.ownerId,
            itemsCount: newList.items.length
        };
    },

    async updateList(listId, updateData) {
        await delay();
        const listIndex = mockLists.findIndex(l => l._id === listId);
        if (listIndex === -1) {
            throw new Error('List not found');
        }
        mockLists[listIndex] = {
            ...mockLists[listIndex],
            ...updateData
        };
        return {
            result: 'ok',
            list: {
                listId: mockLists[listIndex]._id,
                name: mockLists[listIndex].name,
                description: mockLists[listIndex].description,
                ownerId: mockLists[listIndex].ownerId,
                itemsCount: mockLists[listIndex].items.length,
                isArchived: mockLists[listIndex].isArchived
            }
        };
    },

    async deleteList(listId) {
        await delay();
        const listIndex = mockLists.findIndex(l => l._id === listId);
        if (listIndex === -1) {
            throw new Error('List not found');
        }
        mockLists.splice(listIndex, 1);
        return {
            result: 'ok',
            message: `List ${listId} deleted successfully.`
        };
    },

    async updateListItem(listId, itemId, updateData) {
        await delay();
        const list = mockLists.find(l => l._id === listId);
        if (!list) {
            throw new Error('List not found');
        }
        const itemIndex = list.items.findIndex(i => i.itemId === itemId);
        if (itemIndex === -1) {
            throw new Error('Item not found');
        }
        list.items[itemIndex] = {
            ...list.items[itemIndex],
            ...updateData
        };
        return {
            result: 'ok',
            item: list.items[itemIndex]
        };
    }
};





