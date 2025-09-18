import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users,
  Star,
  Calendar
} from 'lucide-react';
import { TaskType, CreateTaskRequestType, TaskCategorySchema, TaskDifficultySchema } from '@/shared/types';

export default function Marketplace() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || task.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Marketplace</h1>
          <p className="text-gray-600 mt-2">Discover earning opportunities that match your skills</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {TaskCategorySchema.options.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {TaskDifficultySchema.options.map(difficulty => (
              <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
            ))}
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new task.</p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateForm && (
        <CreateTaskModal 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task }: { task: TaskType }) {
  const handleApply = async () => {
    // TODO: Implement task application
    console.log('Apply to task:', task.id);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getCategoryIcon(task.category)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
            {task.difficulty}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">${task.reward_amount}</p>
          <p className="text-sm text-gray-500">{task.currency_type}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{task.current_participants}/{task.max_participants || '∞'} participants</span>
        </div>
        
        {task.follower_threshold > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            <span>{task.follower_threshold}+ followers required</span>
          </div>
        )}

        {task.deadline_at && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Due {new Date(task.deadline_at).toLocaleDateString()}</span>
          </div>
        )}

        {task.time_commitment && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{task.time_commitment}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{task.category}</span>
        <button
          onClick={handleApply}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateTaskRequestType>({
    title: '',
    description: '',
    category: 'Content Creation',
    difficulty: 'easy',
    reward_amount: 15,
    currency_type: 'USD',
    follower_threshold: 0,
    time_commitment: '',
    requirements: '',
    deliverables: '',
    deadline_at: '',
    max_participants: undefined,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Failed to create task:', error);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Create Instagram Reel for Product Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe what needs to be done..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {TaskCategorySchema.options.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {TaskDifficultySchema.options.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward Amount ($)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Content Creation': return '🎨';
    case 'Social Sharing': return '📱';
    case 'Review': return '⭐';
    case 'Design': return '🎯';
    case 'Engagement': return '💬';
    default: return '📝';
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'hard': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}
