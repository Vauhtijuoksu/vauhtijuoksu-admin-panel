<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  {
    title: 'Game Data',
    description: 'Manage games, schedules, and participants',
    route: '/edit/gamedata'
  },
  {
    title: 'Incentives',
    description: 'Manage donation incentives and goals',
    route: '/edit/incentives'
  },
  {
    title: 'Participants',
    description: 'Manage runners and commentators',
    route: '/edit/participants'
  }
]
</script>

<template>
  <div class="edit-main-container">
    <div class="header">
      <div>
        <button @click="router.push('/')" class="btn btn-back">← Back to Dashboard</button>
      </div>
      <h1>Admin Panel</h1>
      <div></div>
    </div>

    <div class="menu-grid">
      <router-link 
        v-for="item in menuItems" 
        :key="item.route"
        :to="item.route" 
        class="menu-card"
      >
        <div class="menu-content">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </div>
        <div class="menu-arrow">→</div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.edit-main-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #e0e0e0;
}

.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
  padding-bottom: 20px;
  border-bottom: 2px solid #444;
}

.header h1 {
  margin: 0;
  color: #fff;
  text-align: center;
  font-size: 2em;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
}

.menu-grid {
  display: grid;
  gap: 20px;
}

.menu-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  cursor: pointer;
}

.menu-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
  background: #333;
}

.menu-content {
  flex: 1;
}

.menu-content h2 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 1.4em;
}

.menu-content p {
  margin: 0;
  color: #999;
  font-size: 0.95em;
}

.menu-arrow {
  font-size: 1.8em;
  color: #666;
  transition: all 0.3s;
}

.menu-card:hover .menu-arrow {
  color: #007bff;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .header {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .header h1 {
    text-align: left;
  }
  
  .menu-arrow {
    display: none;
  }
}
</style>
