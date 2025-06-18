import React from 'react'
import { 
  Crown, 
  Flame, 
  Trophy, 
  Target, 
  BookOpen, 
  Search,
  Users,
  Puzzle
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const stats = [
    { label: 'Current Rating', value: '1650' },
    { label: 'Games Played', value: '235' },
    { label: 'Books Read', value: '12' },
  ]

  const todaysTasks = [
    {
      title: 'Daily Puzzle',
      description: 'Tactics Practice',
      image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center',
    },
    {
      title: 'Lesson: Endgames',
      description: 'Current Learning Module',
      image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300&h=200&fit=crop&crop=center',
    },
    {
      title: 'Analyze Game',
      description: 'Upload Recent Game for AI Feedback',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center',
    },
    {
      title: 'Read Chapter 3',
      description: 'Book Study Progress',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
    }
  ]

  const achievements = [
    { icon: Flame, text: 'Weekly Streak: 5 Days' },
    { icon: Trophy, text: 'Tactical Mastery Badge' }
  ]

  const recentGames = [
    { opponent: 'AlexChess2023', result: 'Win', rating: '+12', time: '2 hours ago' },
    { opponent: 'ChessMaster99', result: 'Loss', rating: '-8', time: '1 day ago' },
    { opponent: 'RookiePlayer', result: 'Win', rating: '+15', time: '2 days ago' },
  ]

  return (
    <div className="min-h-screen bg-[#121621] px-4 sm:px-6 lg:px-40 py-5">
      <div className="max-w-[960px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
              Welcome back, Aisha!
            </h1>
          </div>
          <p className="text-[#97a1c4] text-sm font-normal leading-normal pb-3 pt-1 px-4">
            Today's Date: {currentDate}
          </p>
          <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
            "The beauty of chess is it can be whatever you want it to be. It transcends language, age, race, religion, politics, gender, and socioeconomic background. Whatever your circumstances, anyone can enjoy a good fight to the death over 64 squares."
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 p-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#272e45]">
              <p className="text-white text-base font-medium leading-normal">{stat.label}</p>
              <p className="text-white tracking-light text-2xl font-bold leading-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="mb-6">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Progress Overview
          </h2>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-6 justify-between">
              <p className="text-white text-base font-medium leading-normal">Chapters Read in Current Book</p>
              <p className="text-white text-sm font-normal leading-normal">30%</p>
            </div>
            <div className="rounded bg-[#374162]">
              <div className="h-2 rounded bg-blue-800" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="mb-6">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
            Level 15 Chess Player
          </h2>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Recent Achievements
          </h2>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-4 bg-[#121621] px-4 min-h-14">
                <div className="text-white flex items-center justify-center rounded-lg bg-[#272e45] shrink-0 size-10">
                  <achievement.icon className="w-6 h-6" />
                </div>
                <p className="text-white text-base font-normal leading-normal flex-1 truncate">
                  {achievement.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="mb-6">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Today's Tasks
          </h2>
          <div className="space-y-4 p-4">
            {todaysTasks.map((task, index) => (
              <div key={index} className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-[2_2_0px] flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-white text-base font-bold leading-tight">{task.title}</p>
                    <p className="text-[#97a1c4] text-sm font-normal leading-normal">{task.description}</p>
                  </div>
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#272e45] text-white text-sm font-medium leading-normal w-fit hover:bg-[#374162] transition-colors">
                    <span className="truncate">Start</span>
                  </button>
                </div>
                <div 
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{ backgroundImage: `url("${task.image}")` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Games */}
        <div className="mb-6">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Recent Games
          </h2>
          <div className="bg-[#233248] rounded-xl p-6">
            <div className="space-y-4">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#272e45] rounded-lg hover:bg-[#374162] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#121621] rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{game.opponent}</p>
                      <p className="text-[#97a1c4] text-sm">{game.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.result === 'Win' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                    }`}>
                      {game.result}
                    </span>
                    <span className={`text-sm font-medium ${
                      game.rating.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {game.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[#97a1c4] text-sm font-normal leading-normal pb-3 pt-4 px-4 underline cursor-pointer hover:text-blue-400 transition-colors">
              View All Games
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 p-5">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-6 gap-4 hover:bg-blue-700 transition-colors">
            <Search className="w-6 h-6" />
            <span>Find Opponent</span>
          </button>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-6 gap-4 hover:bg-blue-700 transition-colors">
            <Puzzle className="w-6 h-6" />
            <span>Solve Puzzle</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
