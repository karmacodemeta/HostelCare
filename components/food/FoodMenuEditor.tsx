'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Coffee, Sun, Sunset, Moon, Save, Loader2 } from 'lucide-react';
import { updateMenu } from '@/app/actions/food';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FoodMenuEditorProps {
    initialMenu: any;
    branchId: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function FoodMenuEditor({ initialMenu, branchId }: FoodMenuEditorProps) {
    const [activeDay, setActiveDay] = useState('Monday');
    const [isPending, startTransition] = useTransition();
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    
    // Initialize state from db or empty defaults
    // Structure: { Monday: { breakfast: '', ... }, ... }
    const [menuState, setMenuState] = useState(() => {
        const state: any = {};
        DAYS.forEach(day => {
            const key = day.toLowerCase();
            state[day] = initialMenu?.[key] || { breakfast: '', lunch: '', snacks: '', dinner: '' };
        });
        return state;
    });

    const handleChange = (day: string, type: 'breakfast' | 'lunch' | 'snacks' | 'dinner', value: string) => {
        setMenuState((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], [type]: value }
        }));
    };

    const handleSave = () => {
        const dayPayload = menuState[activeDay];
        
        startTransition(async () => {
            const result = await updateMenu(branchId, activeDay, dayPayload);
            if (result.success) {
                toast.success(`${activeDay}'s menu updated!`);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                 <div className="text-sm font-medium px-2 text-zinc-500">Mode:</div>
                 <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
                    <button 
                        onClick={() => setViewMode('edit')}
                        className={cn("px-3 py-1.5 text-sm rounded font-medium transition-all", viewMode === 'edit' ? "bg-white shadow dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900")}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={cn("px-3 py-1.5 text-sm rounded font-medium transition-all", viewMode === 'preview' ? "bg-white shadow dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900")}
                    >
                        Student View
                    </button>
                 </div>
            </div>

            <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    <TabsList className="h-auto p-1 bg-zinc-100 dark:bg-zinc-800 flex w-max md:w-full">
                        {DAYS.map(day => (
                            <TabsTrigger 
                                key={day} 
                                value={day}
                                className="px-4 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm transition-all"
                            >
                                {day.slice(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {DAYS.map(day => (
                    <TabsContent key={day} value={day} className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {viewMode === 'edit' ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Breakfast */}
                                    <MealCard 
                                        title="Breakfast" 
                                        icon={Coffee} 
                                        color="orange" 
                                        value={menuState[day].breakfast} 
                                        onChange={(v: string) => handleChange(day, 'breakfast', v)} 
                                    />
                                    {/* Lunch */}
                                    <MealCard 
                                        title="Lunch" 
                                        icon={Sun} 
                                        color="yellow" 
                                        value={menuState[day].lunch} 
                                        onChange={(v: string) => handleChange(day, 'lunch', v)} 
                                    />
                                    {/* High Tea */}
                                    <MealCard 
                                        title="High Tea / Snacks" 
                                        icon={Sunset} 
                                        color="emerald" 
                                        value={menuState[day].snacks} 
                                        onChange={(v: string) => handleChange(day, 'snacks', v)} 
                                    />
                                    {/* Dinner */}
                                    <MealCard 
                                        title="Dinner" 
                                        icon={Moon} 
                                        color="indigo" 
                                        value={menuState[day].dinner} 
                                        onChange={(v: string) => handleChange(day, 'dinner', v)} 
                                    />
                                </div>

                                <div className="pt-4 flex justify-end sticky bottom-4">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={isPending}
                                        className="shadow-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save {day}'s Menu
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{day}'s Menu</h3>
                                    <p className="text-sm text-zinc-500">As seen by students</p>
                                </div>
                                <div className="space-y-6">
                                    <PreviewRow title="Breakfast" time="8:00 AM - 10:00 AM" item={menuState[day].breakfast} icon={Coffee} color="text-orange-500" />
                                    <PreviewRow title="Lunch" time="12:30 PM - 2:30 PM" item={menuState[day].lunch} icon={Sun} color="text-yellow-500" />
                                    <PreviewRow title="High Tea" time="5:00 PM - 6:00 PM" item={menuState[day].snacks} icon={Sunset} color="text-emerald-500" />
                                    <PreviewRow title="Dinner" time="8:00 PM - 9:30 PM" item={menuState[day].dinner} icon={Moon} color="text-indigo-500" />
                                </div>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function MealCard({ title, icon: Icon, color, value, onChange }: any) {
    const colorClasses: any = {
        orange: 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30 focus-visible:ring-orange-500',
        yellow: 'bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-100 dark:border-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30 focus-visible:ring-yellow-500',
        emerald: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 focus-visible:ring-emerald-500',
        indigo: 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 focus-visible:ring-indigo-500',
    };

    // Parse classes roughly
    const base = colorClasses[color];
    const borderClass = base.split(' ').filter((c: string) => c.startsWith('border-')).join(' ');

    return (
        <Card className={cn("transition-all hover:shadow-sm", base.split(' ').slice(0, 3).join(' '))}>
            <CardContent className="p-4 space-y-3">
                <div className={cn("flex items-center gap-2", base.split(' ').slice(3, 5).join(' '))}>
                    <Icon className="w-5 h-5" />
                    <h4 className="font-semibold">{title}</h4>
                </div>
                <Input 
                    placeholder="Enter menu..." 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn("bg-white dark:bg-zinc-900", borderClass)}
                />
            </CardContent>
        </Card>
    );
}

function PreviewRow({ title, time, item, icon: Icon, color }: any) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className={cn("mt-1 p-2 rounded-full bg-zinc-50 dark:bg-zinc-800 shrink-0", color)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h5 className="font-medium text-zinc-900 dark:text-zinc-100">{title}</h5>
                    <span className="text-xs text-zinc-400">{time}</span>
                </div>
                <p className={cn("text-sm", item ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 italic")}>
                    {item || "Not decided yet"}
                </p>
            </div>
        </div>
    );
}
